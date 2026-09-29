import {Head} from "@inertiajs/react";
import {VotingExperience} from "../features/voting/voting-experience";

export default function VotingPage({title, meta, user}) {
    const currentUrl = `${window.location.href}`
    const mediaUrl = meta?.media

    const pageTitle = title
    const pageDescription = meta?.description

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription}/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="robots" content="index, follow"/>
                {currentUrl && <link rel="canonical" href={currentUrl}/>}

                {/* Open Graph / Facebook / LinkedIn / Telegram */}
                <meta property="og:type" content="website"/>
                {currentUrl && <meta property="og:url" content={currentUrl}/>}
                <meta property="og:title" content={pageTitle}/>
                <meta property="og:description" content={pageDescription}/>
                <meta property="og:image" content={mediaUrl}/>
                <meta property="og:image:secure_url" content={mediaUrl}/>
                <meta property="og:image:width" content="1200"/>
                <meta property="og:image:height" content="630"/>
                <meta property="og:image:alt" content={pageTitle}/>

                {/* Twitter / X */}
                <meta name="twitter:card" content="summary_large_image"/>
                {currentUrl && <meta name="twitter:url" content={currentUrl}/>}
                <meta name="twitter:title" content={pageTitle}/>
                <meta name="twitter:description" content={pageDescription}/>
                <meta name="twitter:image" content={mediaUrl}/>
                <meta name="twitter:image:alt" content={pageTitle}/>

                {/* Favicons */}
                <link rel="icon" href="/favicon.ico" sizes="any"/>
                <link rel="icon" href="/icon.svg" type="image/svg+xml"/>
                <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
            </Head>
            <VotingExperience/>
        </>
    )
}