'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import { Resend } from 'resend'
import { curtainsSchema } from './curtains_schema'
import { QuoteEmail, TileQuotationEmail } from './email'
import { quotationData } from './tile_schema'

const resend = new Resend(process.env.RESEND_API_KEY)
export const sendEmail = action({
	args: {
		quoteData: v.object(curtainsSchema),
		email: v.string(),
	},
	async handler(_, { quoteData, email }) {
		const { data, error } = await resend.emails.send({
			from: 'quotation <onboarding@resend.dev>',
			subject: 'Quote Confirmation',
			to: [email],
			react: QuoteEmail({
				quoteData,
			}),
		})
		if (data) {
			return 'success'
		}
		if (error) {
			console.log(error)
			return 'error'
		}
	},
})
export const sendTileQuotationEmail = action({
	args: {
		quoteData: v.object(quotationData),
		email: v.string(),
	},
	async handler(_, { quoteData, email }) {
		const { data, error } = await resend.emails.send({
			from: 'quotation <onboarding@resend.dev>',
			subject: 'Quote Confirmation',
			to: [email],
			react: TileQuotationEmail({
				quotationData: quoteData,
			}),
		})
		if (data) {
			return 'success'
		}
		if (error) {
			console.log(error)
			return 'error'
		}
	},
})
