import Activity from '@/models/Activity';
import Notification from '@/models/Notification';
import dbConnect from '@/lib/mongodb';

export async function logActivityAndNotify({
  projectId,
  versionId,
  action,
  performedBy,
  performedByType,
  notificationTitle,
  notificationType,
  notificationLink,
}) {
  await dbConnect();

  // Create Activity (only if projectId exists)
  if (projectId) {
    await Activity.create({
      projectId,
      versionId: versionId || undefined,
      action,
      performedBy,
      performedByType,
    });
  }

  // Create Notification
  if (notificationTitle && notificationType) {
    await Notification.create({
      title: notificationTitle,
      type: notificationType,
      link: notificationLink || '',
    });
  }
}
