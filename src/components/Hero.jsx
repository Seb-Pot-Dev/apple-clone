import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { heroVideo, smallHeroVideo } from "../utils";
import { useEffect, useState } from "react";

const Hero = () => {
	const [videoSrc, setVideoSrc] = useState(
		window.innerWidth < 760 ? smallHeroVideo : heroVideo
	);
    // Changer la source selon la largeur de la fenetre
	const handleVideoSrcSet = () => {
		if (window.width < 760) {
			setVideoSrc(smallHeroVideo);
		} else {
			setVideoSrc(heroVideo);
		}
	};
    //ecouter la taille de la fenetre pour appliquer la fonction qui change la video
	useEffect(() => {
		window.addEventListener("resize", handleVideoSrcSet);
		return () => window.removeEventListener("resize", handleVideoSrcSet);
	});

    //animer le texte pour qu'il apparaisse avec du délai + transition
	useGSAP(() => {
		gsap.to("#hero", { opacity: 1, duration: 1, delay: 2 });
        gsap.to("#cta", { opacity: 1, y:-50, duration: 1, delay: 2 })
	});

	return (
		<section className="w-full nav-height bg-black relative">
			<div className="h-5/6 w-full flex-center flex-col">
				<p id="hero" className="hero-title">
					iPhone 15 pro
				</p>
				<div className="md:w-10/12 w-9/12">
					<video
						className="pointer-events-none"
						autoPlay
						muted
						playsInline={true}
						key={videoSrc}
					>
						<source src={videoSrc} type="video/mp4" />
					</video>
				</div>
			</div>
            <div id="cta" className="flex flex-col opacity-0 items-center translate-y-20">
                <a href="#highlights" className="btn">Acheter</a>
                <p className="font-normal text-xl">A partir de 199€/mois ou 999€</p>
            </div>
		</section>
	);
};

export default Hero;
