import { SITE } from './site'

export interface LegalSection {
  id: string
  title: string
  body: string[]
  list?: string[]
}

export const PRIVACY_INTRO =
  'This is a portfolio site. It has no accounts, no forms that store anything and no ad trackers, so there is very little to tell you.'

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'summary',
    title: 'The short version',
    body: [
      'I do not collect personal data through this site. The only way I get your details is if you email me, and then I use them to reply.',
    ],
  },
  {
    id: 'collect',
    title: 'What this site collects',
    body: [
      'Nothing is collected by the pages themselves. The site does not ask you to sign in, does not run analytics or advertising scripts, and does not set cookies.',
      'The contact page builds an email for you in your own email app. The text you type there stays in your browser until you send the email yourself.',
    ],
  },
  {
    id: 'hosting',
    title: 'Hosting and server logs',
    body: [
      'The site is hosted on Vercel. Like any web host, Vercel handles technical request data such as your IP address, browser type and the pages you ask for, so that it can deliver the site and keep it secure. I do not use that data to identify you.',
      'Fonts are served from this site itself, so your browser does not contact a font provider when you visit.',
    ],
  },
  {
    id: 'email',
    title: 'If you email or call me',
    body: [
      `If you write to ${SITE.email} or use the phone number on the contact page, I receive what you send, such as your name, address and message. I use it only to reply and to take the conversation forward, and I keep it for as long as that conversation needs it.`,
      'I do not sell it or share it with anyone else.',
    ],
  },
  {
    id: 'links',
    title: 'Links to other sites',
    body: [
      'This site links to LinkedIn and GitHub. Those sites have their own privacy policies, and I am not responsible for how they handle your data.',
    ],
  },
  {
    id: 'rights',
    title: 'Your choices',
    body: ['You can email me at any time to:'],
    list: [
      'ask what I hold about you',
      'have something corrected',
      'have your emails and details deleted',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: [
      'If the site starts collecting anything new, I will update this page first and change the date below.',
      `Last updated ${SITE.effective}.`,
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: [`Questions about this policy go to ${SITE.email}.`],
  },
]
