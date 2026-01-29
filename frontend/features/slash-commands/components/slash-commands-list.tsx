"use client";

import { Settings, Trash2 } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import type { SlashCommand } from "@/features/slash-commands/types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SlashCommandsListProps {
  commands: SlashCommand[];
  savingId?: number | null;
  onToggleEnabled?: (commandId: number, enabled: boolean) => void;
  onEdit?: (command: SlashCommand) => void;
  onDelete?: (command: SlashCommand) => void;
}

export function SlashCommandsList({
  commands,
  savingId,
  onToggleEnabled,
  onEdit,
  onDelete,
}: SlashCommandsListProps) {
  const { t } = useT("translation");

  const enabledCount = commands.filter((c) => c.enabled).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/50 px-5 py-3">
        <span className="text-sm text-muted-foreground">
          {t("library.slashCommands.summary", "可用命令")} {commands.length} ·{" "}
          {t("library.slashCommands.enabled", "已启用")} {enabledCount}
        </span>
      </div>

      <div className="space-y-2">
        {commands.map((cmd) => {
          const busy = savingId === cmd.id;
          const modeLabel =
            cmd.mode === "structured"
              ? t("library.slashCommands.mode.structured", "结构化")
              : t("library.slashCommands.mode.raw", "Markdown");

          return (
            <div
              key={cmd.id}
              className="flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium font-mono">/{cmd.name}</span>
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {modeLabel}
                  </Badge>
                </div>
                {cmd.description ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {cmd.description}
                  </p>
                ) : null}
                {cmd.argument_hint ? (
                  <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                    {cmd.argument_hint}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEdit?.(cmd)}
                  disabled={busy}
                  title={t("common.edit", "编辑")}
                >
                  <Settings className="size-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={busy}
                      title={t("common.delete")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("library.slashCommands.delete.title", "删除命令？")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t(
                          "library.slashCommands.delete.description",
                          "删除后将无法在会话中使用该命令。",
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("common.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete?.(cmd)}>
                        {t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Switch
                  checked={cmd.enabled}
                  onCheckedChange={(checked) =>
                    onToggleEnabled?.(cmd.id, checked)
                  }
                  disabled={busy}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
