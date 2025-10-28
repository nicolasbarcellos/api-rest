import {SESClient, SendEmailCommand} from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

interface SendVerificationEmailParams {
  to: string
  name: string
  code: string
}

export async function sendVerificationEmail({to, name, code}: SendVerificationEmailParams) {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'us-east-1'

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <html>
              <body>
                <h1>Verify your email address</h1>
                <p>Hello ${name}</p>
                <p>Thank you for registering. To verify your email address, please use the following code:</p>
                <h2>${code}</h2>
                <p>If you didn't request this code, you can safely ignore this email.</p>
              </body>
            </html>
          `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Verify your email address'
      }
    }
  }

  try {
    const command = new SendEmailCommand(params)
    await sesClient.send(command)
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw new Error('Falha ao enviar email de verificação')
  }
}