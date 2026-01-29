import { ScheduledTaskDetailPageClient } from "@/features/scheduled-tasks/components/scheduled-task-detail-page-client";

export default async function ScheduledTaskDetailPage({
  params,
}: {
  params: Promise<{ lng: string; taskId: string }>;
}) {
  const { taskId } = await params;
  return <ScheduledTaskDetailPageClient taskId={taskId} />;
}
