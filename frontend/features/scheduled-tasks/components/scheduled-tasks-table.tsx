"use client";

import { useMemo } from "react";
import { Pencil, Play, Trash2 } from "lucide-react";

import { useT } from "@/lib/i18n/client";
import { useAppShell } from "@/components/shared/app-shell-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import type { ScheduledTask } from "@/features/scheduled-tasks/types";

interface ScheduledTasksTableProps {
  tasks: ScheduledTask[];
  savingId: string | null;
  onToggleEnabled: (task: ScheduledTask) => void;
  onOpen: (task: ScheduledTask) => void;
  onEdit: (task: ScheduledTask) => void;
  onTrigger: (task: ScheduledTask) => void;
  onDelete: (task: ScheduledTask) => void;
}

export function ScheduledTasksTable({
  tasks,
  savingId,
  onToggleEnabled,
  onOpen,
  onEdit,
  onTrigger,
  onDelete,
}: ScheduledTasksTableProps) {
  const { t } = useT("translation");
  const { lng } = useAppShell();

  const statusLabel = (status: string | null | undefined) => {
    const normalized = (status || "").trim().toLowerCase();
    if (!normalized || normalized === "-") return "-";
    const known = new Set([
      "queued",
      "claimed",
      "running",
      "completed",
      "failed",
      "canceled",
    ]);
    const key = known.has(normalized) ? normalized : "unknown";
    return t(`library.scheduledTasks.status.${key}`);
  };

  const formatDateTime = (
    value: string | null | undefined,
    timeZone: string | null | undefined,
  ) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    try {
      return new Intl.DateTimeFormat(lng, {
        timeZone: timeZone || undefined,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  };

  const rows = useMemo(() => {
    return tasks.map((task) => {
      return {
        ...task,
        nextRunAt: task.next_run_at,
        lastStatus: task.last_run_status ?? "-",
      };
    });
  }, [tasks]);

  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.name")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.enabled")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.cron")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.timezone")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.nextRunAt")}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("library.scheduledTasks.fields.lastStatus")}
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {t("library.scheduledTasks.fields.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {t("library.scheduledTasks.page.empty")}
              </td>
            </tr>
          ) : null}
          {rows.map((task) => {
            const busy = savingId === task.scheduled_task_id;
            return (
              <tr
                key={task.scheduled_task_id}
                className="border-t border-border"
              >
                <td className="px-4 py-3 font-medium">
                  <Button
                    variant="link"
                    className="px-0 h-auto"
                    onClick={() => onOpen(task)}
                    disabled={busy}
                    title={task.name}
                  >
                    <span className="max-w-[320px] truncate">{task.name}</span>
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={task.enabled}
                    onCheckedChange={() => onToggleEnabled(task)}
                    disabled={busy}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{task.cron}</td>
                <td className="px-4 py-3">{task.timezone}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {formatDateTime(task.nextRunAt, task.timezone)}
                </td>
                <td className="px-4 py-3">{statusLabel(task.lastStatus)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onEdit(task)}
                      disabled={busy}
                    >
                      <Pencil className="size-4" />
                      {t("library.scheduledTasks.detail.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => onTrigger(task)}
                      disabled={busy}
                    >
                      <Play className="size-4" />
                      {t("library.scheduledTasks.page.trigger")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          disabled={busy}
                        >
                          <Trash2 className="size-4" />
                          {t("common.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("library.scheduledTasks.detail.deleteTitle")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              "library.scheduledTasks.detail.deleteDescription",
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t("common.cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(task)}>
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
