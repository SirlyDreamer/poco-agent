import logging
import unicodedata
import uuid

from openai import OpenAI

from app.core.database import SessionLocal
from app.core.settings import get_settings
from app.repositories.session_repository import SessionRepository

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an assistant skilled in conversation. "
    "You need to summarize the user's conversation into a title within 10 words. "
    "The language of the title should be consistent with the user's primary language. "
    "Return only the title as plain text, without punctuation or special symbols, "
    "and without any prefixes, quotes, or extra lines."
)


class SessionTitleService:
    def __init__(self) -> None:
        settings = get_settings()
        self._enabled = bool(settings.openai_api_key)
        self._client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
        )
        self._model = settings.openai_default_model
        if not self._enabled:
            logger.warning("OPENAI_API_KEY is not set; title generation disabled")

    def generate_and_update(self, session_id: uuid.UUID, prompt: str) -> None:
        if not prompt or not prompt.strip():
            return

        title = self._generate_title(prompt)
        if not title:
            return

        db = SessionLocal()
        try:
            db_session = SessionRepository.get_by_id(db, session_id)
            if not db_session:
                logger.warning(
                    "Title generation skipped: session not found %s", session_id
                )
                return
            if db_session.title:
                return
            db_session.title = title
            db.commit()
            logger.info("Generated title for session %s", session_id)
        except Exception as exc:
            logger.exception("Failed to persist session title: %s", exc)
        finally:
            db.close()

    def _generate_title(self, prompt: str) -> str | None:
        if not self._enabled:
            return None
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=32,
            )
        except Exception as exc:
            logger.exception("OpenAI title generation failed: %s", exc)
            return None

        if not response.choices:
            return None

        content = response.choices[0].message.content or ""
        cleaned = self._sanitize_title(content)
        if not cleaned:
            return None
        return cleaned

    def _sanitize_title(self, text: str) -> str:
        text = text.replace("\r", " ").replace("\n", " ").strip()
        text = text.replace('"', "").replace("'", "")

        cleaned_chars: list[str] = []
        for ch in text:
            if ch.isspace():
                cleaned_chars.append(" ")
                continue
            category = unicodedata.category(ch)
            if category.startswith("P") or category.startswith("S"):
                continue
            cleaned_chars.append(ch)

        cleaned = "".join(cleaned_chars)
        cleaned = " ".join(cleaned.split())

        if not cleaned:
            return ""

        words = cleaned.split(" ")
        if len(words) > 10:
            cleaned = " ".join(words[:10])
        return cleaned
