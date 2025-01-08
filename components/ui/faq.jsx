'use client';
import { FAQList } from '../../lib/faqslist';
import { motion } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '@radix-ui/react-accordion';

export default function Feature({ locale, langName = 'en' }) {
	let list = FAQList[`FAQ_${langName.toUpperCase()}`] || [];
	return (
		<section
			id='faq'
			className='relative py-10 md:py-20 text-white'
		>
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.5,
				}}
			>
				<div className='relative z-10 flex flex-col gap-5 items-start md:items-center mb-10 mx-auto'>
					<div className='relative inline-flex items-center justify-center gap-2 border-2 border-base-content px-5 md:px-10 py-1 md:py-3 rounded-full text-lg md:text-2xl font-semibold overflow-hidden group primary-gradient primary-shadow border-gray-800'>
						<div className='inline-flex items-center justify-center gap-2 z-10 '>
							<FaQuestionCircle /> <h2 className='text-white'>FAQs</h2>
						</div>
						<div className='absolute w-0 h-full bg-base-content z-[0]'></div>
					</div>

					<h3 className='font-bold text-3xl md:text-5xl bg-gradient-to-r from-base-content from-50% to-[#9c9c9c] md:text-center bg-clip-text text-transparent !leading-[1.25em]'>
						Frequently Asked Questions
					</h3>

					
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.5,
				}}
			>
				<div className='relative z-10 w-full md:w-10/12 mx-auto flex flex-col gap-5'>
				<Accordion type="single" collapsible className="space-y-4 ">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted px-4 py-3 font-medium transition-colors hover:bg-muted/50 primary-gradient primary-shadow border-gray-800 text-white">
                <span>What types of contracts can I upload?</span>
                <div className="h-5 w-5 text-muted-foreground" />
              </AccordionTrigger>
              <AccordionContent className="rounded-md border bg-background px-4 py-3 text-muted-foreground shadow-sm primary-gradient primary-shadow border-gray-800">
                <p>
                You can upload contracts in various formats, including PDF and Word documents. The app supports a wide range of contract types, from employment agreements to service contracts.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted px-4 py-3 font-medium transition-colors hover:bg-muted/50 primary-gradient primary-shadow border-gray-800">
                <span>How does the AI analyze my contract?</span>
                <div className="h-5 w-5 text-muted-foreground" />
              </AccordionTrigger>
              <AccordionContent className="rounded-md border bg-background px-4 py-3 text-muted-foreground shadow-sm primary-gradient primary-shadow border-gray-800">
                <p>
                The AI scans your uploaded contract to identify key clauses, terms, and sections. It uses this analysis to answer your questions and provide context-aware references from the document. 
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted px-4 py-3 font-medium transition-colors hover:bg-muted/50 primary-gradient primary-shadow border-gray-800">
                <span>Can I sign my contract within the app?</span>
                <div className="h-5 w-5 text-muted-foreground" />
              </AccordionTrigger>
              <AccordionContent className="rounded-md border bg-background px-4 py-3 text-muted-foreground shadow-sm primary-gradient primary-shadow border-gray-800">
                <p>
                Yes, the app includes secure e-signature functionality, allowing you to digitally sign your contracts directly within the platform.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted px-4 py-3 font-medium transition-colors hover:bg-muted/50 primary-gradient primary-shadow border-gray-800">
                <span>Does the app support multiple languages?</span>
                <div className="h-5 w-5 text-muted-foreground" />
              </AccordionTrigger>
              <AccordionContent className="rounded-md border bg-background px-4 py-3 text-muted-foreground shadow-sm primary-gradient primary-shadow border-gray-800">
                <p>
                Absolutely! The app can analyze and provide answers in various languages, ensuring you can work with contracts in your preferred language.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
				</div>
			</motion.div>

			<div className='hidden md:block absolute left-[50%] top-[30%] z-0'>
				<div className='absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]'></div>
			</div>
		</section>
	);
}
