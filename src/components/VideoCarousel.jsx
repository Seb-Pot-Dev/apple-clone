import gsap from "gsap"; 
import { useGSAP } from "@gsap/react"; 
import { ScrollTrigger } from "gsap/all"; 
gsap.registerPlugin(ScrollTrigger); 
import { useEffect, useRef, useState } from "react"; 
import { hightlightsSlides } from "../constants"; // Liste des vidéos à afficher
import { pauseImg, playImg, replayImg } from "../utils"; // Images pour les boutons de contrôle (lecture/pause/replay)

const VideoCarousel = () => {
	const videoRef = useRef([]); // Références aux balises vidéo
	const videoSpanRef = useRef([]); // Références aux barres de progression des vidéos
	const videoDivRef = useRef([]); // Références aux conteneurs des barres de progression

	// État pour gérer la vidéo en cours, si elle joue, et si elle est terminée
	const [video, setVideo] = useState({
		isEnd: false,
		startPlay: false,
		videoId: 0, // ID de la vidéo en cours
		isLastVideo: false,
		isPlaying: false, // Indique si la vidéo est en cours de lecture
	});

	// État pour gérer les données de chargement des vidéos
	const [loadedData, setLoadedData] = useState([]);
	const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

	useGSAP(() => {
		// Animation du carrousel pour faire défiler les vidéos horizontalement
		gsap.to("#slider", {
			transform: `translateX(${-100 * videoId}%)`, // Translate pour faire défiler les vidéos
			duration: 2,
			ease: "power2.inOut", // Transition fluide
		});

		// Animation pour jouer la vidéo automatiquement lorsqu'elle est visible
		gsap.to("#video", {
			scrollTrigger: {
				trigger: "#video", // Déclenchement lorsque la vidéo est visible
				toggleActions: "restart none none none", // Redémarre l'animation à chaque apparition
			},
			onComplete: () => {
				// Démarre la vidéo et met à jour l'état
				setVideo((pre) => ({
					...pre,
					startPlay: true,
					isPlaying: true,
				}));
			},
		});
	}, [isEnd, videoId]); // Réexécute l'animation lorsque la vidéo ou son état change

	useEffect(() => {
		let currentProgress = 0;
		let span = videoSpanRef.current;

		if (span[videoId]) {
			// Animation de la barre de progression de la vidéo
			let anim = gsap.to(span[videoId], {
				onUpdate: () => {
					// Mise à jour de la progression en fonction de l'animation
					const progress = Math.ceil(anim.progress() * 100);

					if (progress != currentProgress) {
						currentProgress = progress;

						// Ajuste la largeur de la barre de progression selon la taille de l'écran
						gsap.to(videoDivRef.current[videoId], {
							width:
								window.innerWidth < 760
									? "10vw" // mobile
									: window.innerWidth < 1200
									? "10vw" // tablette
									: "4vw", // laptop
						});

						// Modifie la largeur et la couleur de la barre de progression
						gsap.to(span[videoId], {
							width: `${currentProgress}%`,
							backgroundColor: "white",
						});
					}
				},

				// Lors de la fin de la vidéo, réduit la barre et change la couleur
				onComplete: () => {
					if (isPlaying) {
						gsap.to(videoDivRef.current[videoId], {
							width: "12px", // Réduit la barre de progression
						});
						gsap.to(span[videoId], {
							backgroundColor: "#afafaf", // Change la couleur de la barre
						});
					}
				},
			});

			if (videoId === 0) {
				anim.restart(); // Redémarre l'animation si c'est la première vidéo
			}

			// Fonction pour mettre à jour la progression de la barre en fonction du temps actuel de la vidéo
			const animUpdate = () => {
				anim.progress(
					videoRef.current[videoId].currentTime /
						hightlightsSlides[videoId].videoDuration
				);
			};

			if (isPlaying) {
				// Ajoute une fonction d'update pour mettre à jour la barre de progression en continu
				gsap.ticker.add(animUpdate);
			} else {
				// Supprime la fonction d'update si la vidéo est en pause
				gsap.ticker.remove(animUpdate);
			}
		}
	}, [videoId, startPlay]); // Déclenche l'animation chaque fois que l'ID vidéo ou la lecture change

	useEffect(() => {
		// Gère la lecture ou la pause des vidéos selon leur état
		if (loadedData.length > 3) {
			if (!isPlaying) {
				videoRef.current[videoId].pause();
			} else {
				startPlay && videoRef.current[videoId].play();
			}
		}
	}, [startPlay, videoId, isPlaying, loadedData]);

	// Gère différents événements comme la fin de la vidéo, la lecture ou la pause
	const handleProcess = (type, i) => {
		switch (type) {
			case "video-end":
				// Passe à la vidéo suivante à la fin
				setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
				break;

			case "video-last":
				// Indique que c'est la dernière vidéo
				setVideo((pre) => ({ ...pre, isLastVideo: true }));
				break;

			case "video-reset":
				// Réinitialise à la première vidéo
				setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
				break;

			case "pause":
			case "play":
				// Alterne entre la lecture et la pause
				setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
				break;

			default:
				return video;
		}
	};

	// Met à jour les données une fois les métadonnées de la vidéo chargées
	const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]);

	return (
		<>
			{/* Carrousel vidéo */}
			<div className="flex items-center">
				{hightlightsSlides.map((list, i) => (
					<div key={list.id} id="slider" className="sm:pr-20 pr-10">
						<div className="video-carousel_container">
							{/* Lecture vidéo */}
							<div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
								<video
									id="video"
									playsInline={true}
									className={`${
										list.id === 2 && "translate-x-44"
									} pointer-events-none`}
									preload="auto"
									muted
									ref={(el) => (videoRef.current[i] = el)}
									onEnded={() =>
										i !== 3
											? handleProcess("video-end", i)
											: handleProcess("video-last")
									}
									onPlay={() =>
										setVideo((pre) => ({
											...pre,
											isPlaying: true,
										}))
									}
									onLoadedMetadata={(e) =>
										handleLoadedMetaData(i, e)
									}
								>
									<source src={list.video} type="video/mp4" />
								</video>
							</div>

							{/* Texte par-dessus les vidéos */}
							<div className="absolute top-12 left-[5%] z-10">
								{list.textLists.map((text, i) => (
									<p
										key={i}
										className="md:text-2xl text-xl font-medium"
									>
										{text}
									</p>
								))}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Indicateurs de progression */}
			<div className="relative flex-center mt-10">
				<div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
					{videoRef.current.map((_, i) => (
						<span
							key={i}
							className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
							ref={(el) => (videoDivRef.current[i] = el)}
						>
							<span
								className="absolute h-full w-full rounded-full"
								ref={(el) => (videoSpanRef.current[i] = el)}
							/>
						</span>
					))}
				</div>

				{/* Bouton de contrôle lecture/pause/replay */}
				<button
					className="control-btn"
					onClick={
						isLastVideo
							? () => handleProcess("video-reset")
							: !isPlaying
							? () => handleProcess("play")
							: () => handleProcess("pause")
					}
				>
					<img
						src={
							isLastVideo
								? replayImg
								: !isPlaying
								? playImg
								: pauseImg
						}
						alt={
							isLastVideo
								? "replay"
								: !isPlaying
								? "play"
								: "pause"
						}
					/>
				</button>
			</div>
		</>
	);
};

export default VideoCarousel;
