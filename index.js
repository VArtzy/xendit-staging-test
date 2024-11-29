import { Invoice as InvoiceClient } from 'xendit-node'

const xenditInvoiceClient = new InvoiceClient({secretKey: process.env.XENDIT_SECRET_KEY})

const data = {
  "amount" : 10000,
  "invoiceDuration" : 172800,
  "externalId" : "test1234",
  "description" : "Test Invoice",
  "currency" : "IDR",
  "reminderTime" : 1
}

const response = await xenditInvoiceClient.createInvoice({ data })
console.log(response)
