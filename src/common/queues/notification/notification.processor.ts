import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Inject, Injectable } from '@nestjs/common'

@Processor('notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  constructor (
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: { defaultApp: any },
  ) {
    super()
  }

  async process (job: Job): Promise<void> {
    const { fcmToken, title, body } = job.data

    try {
      await this.firebaseAdmin.defaultApp.messaging().send({
        notification: { title, body },
        token: fcmToken,
        data: {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      })

      console.log(`Push Notification Sent: ${title}`)
    } catch (error) {
      console.error('Push Notification Error:', error)
    }
  }
}
