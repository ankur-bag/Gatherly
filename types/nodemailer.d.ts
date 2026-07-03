declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string
    to?: string
    subject?: string
    html?: string
  }

  export interface SentMessageInfo {
    [key: string]: unknown
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>
  }

  export interface CreateTransportOptions {
    host?: string
    port?: number
    secure?: boolean
    service?: string
    auth?: {
      user?: string
      pass?: string
    }
  }

  export function createTransport(options: CreateTransportOptions): Transporter

  const nodemailer: {
    createTransport: typeof createTransport
  }

  export default nodemailer
}
