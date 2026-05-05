require('dotenv').config();
const pool = require('./src/config/db');

const seedGoogleReviews = async () => {
  const reviews = [
    {
      name: "Idriss",
      rating: 5,
      comment: "Espace très sympa, idéal pour un repas entre amis ou en famille. Le cadre est agréable, le personnel accueillant et à l'écoute. Le service a été rapide, ce qui est toujours appréciable."
    },
    {
      name: "Lamiyaa Boudouane",
      rating: 5,
      comment: "Les burgers sont délicieux frais et parfaitement préparés. Le goût est incroyable et les portions généreuses. Le personnel est accueillant, souriant et très professionnel. Vraiment le meilleur spot de burger à Fès si ce n’est au Maroc !"
    },
    {
      name: "Amel Bouabid",
      rating: 5,
      comment: "Très très bon burger, l'équipe est génial.. ils nous ont reçu alors qu'il n'y avait pas de place et ont trouvé une solution. Je recommande."
    },
    {
      name: "ScOrpwOlf Officiel",
      rating: 5,
      comment: "Endroit trop calme et la nourriture fraîche avec un prix raisonnable. On ne discute pas le goût parce qu'il est vraiment délicieux, et le staff est vraiment gentil, tout comme le service."
    }
  ];

  try {
    console.log('Suppression des anciens avis...');
    await pool.query('DELETE FROM reviews');

    console.log('Insertion des nouveaux avis Google...');
    for (const review of reviews) {
      await pool.query(
        'INSERT INTO reviews (name, rating, comment, is_approved) VALUES ($1, $2, $3, TRUE)',
        [review.name, review.rating, review.comment]
      );
    }
    console.log('✅ Avis Google insérés avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de l\'insertion :', err);
    process.exit(1);
  }
};

seedGoogleReviews();
