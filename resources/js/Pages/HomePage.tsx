import {Head} from "@inertiajs/react";
import {HomeExperience} from "../features/home/home-experience";

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Tree of Unity — A symbol of humanity</title>
                <meta name="description" content="A symbol of humanity interactive experience" />
                <meta property="og:title" content="Tree of Unity" />
            </Head>
            <HomeExperience />
        </>
    );
}