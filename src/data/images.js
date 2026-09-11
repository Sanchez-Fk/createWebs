/* ===========================================================================
   FOTOS — archivos WebP servidos desde public/images (fotos de Unsplash).
   Las portadas tienen una versión de 800 px para móviles (IMG_SRCSET).
   Para añadir una foto: copia el .webp a public/images y regístrala aquí
   con su autor en CREDITS; las pruebas comprueban que el archivo existe.
   =========================================================================== */
export const IMG = {
  barberChair: '/images/barberChair.webp',
  barberHero: '/images/barberHero.webp',
  dentalHero: '/images/dentalHero.webp',
  dishAntipasto: '/images/dishAntipasto.webp',
  dishPesto: '/images/dishPesto.webp',
  dishPizza: '/images/dishPizza.webp',
  dishSpaghetti: '/images/dishSpaghetti.webp',
  dishTiramisu: '/images/dishTiramisu.webp',
  gymFunctional: '/images/gymFunctional.webp',
  gymHero: '/images/gymHero.webp',
  gymSpin: '/images/gymSpin.webp',
  gymStrength: '/images/gymStrength.webp',
  gymYoga: '/images/gymYoga.webp',
  restHero: '/images/restHero.webp'
};

export const IMG_SRCSET = {
  barberHero: '/images/barberHero-800.webp 800w, /images/barberHero.webp 1200w',
  dentalHero: '/images/dentalHero-800.webp 800w, /images/dentalHero.webp 1200w',
  gymHero: '/images/gymHero-800.webp 800w, /images/gymHero.webp 1200w',
  restHero: '/images/restHero-800.webp 800w, /images/restHero.webp 1200w'
};

export const CREDITS = {
  barberChair: 'Adam Winger',
  barberHero: 'František Čaník',
  dentalHero: 'Kari Bjorn Photography',
  dishAntipasto: 'Jay Wennington',
  dishPesto: 'Eaters Collective',
  dishPizza: 'Ivan Torres',
  dishSpaghetti: 'Mae Mu',
  dishTiramisu: 'Olga Petnyunene',
  gymFunctional: 'Meghan Holmes',
  gymHero: 'Samuel Girven',
  gymSpin: 'Humphrey M',
  gymStrength: 'Unsplash',
  gymYoga: 'bruce mars',
  restHero: 'Liubov Ilchuk'
};
