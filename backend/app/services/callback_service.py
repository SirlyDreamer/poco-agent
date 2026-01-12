import logging

from sqlalchemy.orm import Session

from app.schemas.callback import (
    AgentCallbackRequest,
    CallbackResponse,
    CallbackStatus,
)
from app.schemas.session import SessionUpdateRequest
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)


class CallbackService:
    """Service layer for processing executor callbacks."""

    def process_agent_callback(
        self, db: Session, callback: AgentCallbackRequest
    ) -> CallbackResponse:
        """Processes agent callback and updates session.

        Returns:
            CallbackResponse with processing result.
        """
        session_service = SessionService()
        db_session = session_service.find_session_by_sdk_id_or_uuid(
            db, callback.session_id
        )

        if not db_session:
            logger.warning(f"Session not found for callback: {callback.session_id}")
            return CallbackResponse(
                session_id=callback.session_id,
                status="callback_received",
                message="Session not found yet",
            )

        if callback.status in [CallbackStatus.COMPLETED, CallbackStatus.FAILED]:
            session_service.update_session(
                db, db_session.id, SessionUpdateRequest(status=callback.status.value)
            )
            logger.info(
                f"Updated session {db_session.id} status to {callback.status.value} "
                f"via callback from {callback.session_id}"
            )

        # TODO: Persist state_patch
        # TODO: Record new_message

        return CallbackResponse(
            session_id=str(db_session.id),
            status=db_session.status,
            callback_status=callback.status,
        )
