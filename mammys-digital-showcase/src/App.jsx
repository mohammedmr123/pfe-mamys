import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Instagram,
  MapPin,
  Phone,
  Clock,
  Star,
  Menu as MenuIcon,
  X,
  Facebook,
  Twitter,
  Calendar,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IMG_BASE = API_URL.replace('/api', '');
const translations = {
  fr: {
    about: "À PROPOS",
    menu: "MENU DIGITAL",
    reservation: "RÉSERVATION",
    reviews: "AVIS",
    heroSub: "Le Smashed Burger Ultime",
    heroTitle: "NOTRE GOÛT ",
    heroTitleGradient: "NOTRE RÈGLE",
    heroDesc: "Des ingrédients frais, une viande smashée à la perfection et des recettes qui cassent les codes de la street food.",
    viewMenu: "Voir le Menu Digital",
    bookTable: "Réserver une Table",
    reserveTitle: "RÉSERVER UNE TABLE",
    reserveSub: "Évitez l'attente, réservez en ligne",
    confirmRes: "Confirmer la Réservation",
    orderNow: "Commander",
    menuOption: "Option Menu +20 DH",
    address: "Adresse",
    phone: "Téléphone",
    hours: "Horaires",
    joinUs: "NOUS REJOINDRE"
  },
  en: {
    about: "ABOUT US",
    menu: "DIGITAL MENU",
    reservation: "RESERVATION",
    reviews: "REVIEWS",
    heroSub: "The Ultimate Smashed Burger",
    heroTitle: "OUR TASTE ",
    heroTitleGradient: "OUR RULE",
    heroDesc: "Fresh ingredients, meat smashed to perfection and recipes that break the codes of street food.",
    viewMenu: "View Digital Menu",
    bookTable: "Book a Table",
    reserveTitle: "BOOK A TABLE",
    reserveSub: "Avoid the wait, book online",
    confirmRes: "Confirm Reservation",
    orderNow: "Order Now",
    menuOption: "Menu Option +20 DH",
    address: "Address",
    phone: "Phone",
    hours: "Hours",
    joinUs: "JOIN US"
  },
  ar: {
    about: "من نحن",
    menu: "القائمة الرقمية",
    reservation: "حجز طاولة",
    reviews: "آراء العملاء",
    heroSub: "أفضل سماشد برجر",
    heroTitle: "مذاقنا ",
    heroTitleGradient: "قاعدتنا",
    heroDesc: "مكونات طازجة، لحم مشوي بإتقان ووصفات تكسر قواعد أكل الشارع.",
    viewMenu: "عرض القائمة",
    bookTable: "احجز طاولة",
    reserveTitle: "حجز طاولة",
    reserveSub: "تجنب الانتظار، احجز عبر الإنترنت",
    confirmRes: "تأكيد الحجز",
    orderNow: "اطلب الآن",
    menuOption: "إضافة قائمة +20 درهم",
    address: "العنوان",
    phone: "الهاتف",
    hours: "الأوقات",
    joinUs: "انضم إلينا"
  }
};

const ProductCard3D = ({ product, categories, IMG_BASE, setSelectedProduct, t, isAr }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotX = (y - centerY) / 10;
    const rotY = (centerX - x) / 10;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const category = categories.find(c => c.id === product.category_id)?.name;
  const isMainItem = ['Chicken Burgers', 'Beef Burgers (Smashed)', 'Tacos', 'Sandwiches'].includes(category);

  return (
    <motion.div
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => isMainItem && setSelectedProduct(product)}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      animate={{
        rotateX,
        rotateY,
        scale: rotateX !== 0 ? 1.05 : 1
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 1 }}
      className="group relative bg-white/5 rounded-[3rem] overflow-visible border border-white/5 cursor-pointer"
    >
      <div className="h-72 overflow-visible relative flex items-center justify-center pt-8" style={{ transformStyle: 'preserve-3d' }}>
        {isMainItem && (
          <div className={`absolute top-5 ${isAr ? 'right-5' : 'left-5'} z-20`}>
            <span className="px-4 py-1.5 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest">
              {t.menuOption}
            </span>
          </div>
        )}

        {/* Shadow layer */}
        <div className="absolute bottom-10 w-3/4 h-8 bg-black/40 blur-2xl rounded-full scale-90 group-hover:scale-110 transition-transform duration-500"></div>

        {/* The "Pop-out" Image */}
        <motion.img
          src={product.image_url?.includes('/') ? `${IMG_BASE}${product.image_url}` : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500'}
          alt={product.name}
          style={{
            translateZ: 100, // This makes it pop out
            filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
          }}
          className="w-64 h-64 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
        />

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]"></div>
      </div>

      <div className="p-8 relative z-20 bg-gradient-to-b from-transparent to-black/40 rounded-b-[3rem]" style={{ translateZ: 50 }}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black uppercase italic leading-none group-hover:text-primary transition-colors">{product.name}</h3>
          <span className="text-primary font-black text-2xl">{product.price} <span className="text-xs">DH</span></span>
        </div>
        <p className="text-slate-500 text-sm mb-6 font-medium">Préparé sur commande avec les meilleurs produits locaux.</p>
        <button className="w-full py-4 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300">
          {isMainItem ? 'Personnaliser' : t.orderNow}
        </button>
      </div>
    </motion.div>
  );
};

const RevealText = ({ text, className }) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
      scale: 0.8,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
      },
    },
  };

  return (
    <motion.div
      style={{
        display: "flex",
        flexWrap: "wrap",
        perspective: "1000px"
      }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          key={index}
          className={letter === " " ? "w-4" : "inline-block"}
          style={{
            background: "linear-gradient(to bottom, #FFD700, #FFFFFF, #FFD700)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite"
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const FloatingIngredients = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -1000]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -2000]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const ingredients = [
    { src: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png', y: y1, top: '15%', left: '10%', size: 'w-16', opacity: 'opacity-20' },
    { src: 'https://cdn-icons-png.flaticon.com/512/1155/1155280.png', y: y2, top: '45%', right: '5%', size: 'w-24', opacity: 'opacity-10' },
    { src: 'https://cdn-icons-png.flaticon.com/512/1155/1155276.png', y: y3, top: '75%', left: '8%', size: 'w-20', opacity: 'opacity-15' },
    { src: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png', y: y2, top: '25%', right: '15%', size: 'w-12', opacity: 'opacity-20' },
    { src: 'https://cdn-icons-png.flaticon.com/512/1155/1155284.png', y: y1, top: '85%', right: '10%', size: 'w-32', opacity: 'opacity-5' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ingredients.map((ing, i) => (
        <motion.img
          key={i}
          src={ing.src}
          style={{
            y: ing.y,
            rotate,
            top: ing.top,
            left: ing.left,
            right: ing.right
          }}
          className={`absolute ${ing.size} ${ing.opacity} blur-[1px]`}
          alt=""
        />
      ))}
    </div>
  );
};

const App = () => {
  const { scrollYProgress } = useScroll(); // Also used for top progress bar if needed
  const [lang, setLang] = useState('fr');
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Customizer state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [isMenuSelected, setIsMenuSelected] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState('Coca-Cola');
  const [selectedSide, setSelectedSide] = useState('Frites');

  // Form states
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reservationForm, setReservationForm] = useState({ name: '', phone: '', date: '', time: '', guests: 2 });
  const [formStatus, setFormStatus] = useState({ review: '', reservation: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, revRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/website/reviews`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
        setReviews(revRes.data);
        if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id);

        // Fetch toppings (assuming they are in a specific category or we filter them)
        const toppingsCat = catRes.data.find(c => c.name.toLowerCase() === 'toppings');
        if (toppingsCat) {
          setToppings(prodRes.data.filter(p => p.category_id === toppingsCat.id));
        }
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/website/reviews`, reviewForm);
      setFormStatus({ ...formStatus, review: 'Avis envoyé ! Merci.' });
      setReviewForm({ name: '', rating: 5, comment: '' });
      const res = await axios.get(`${API_URL}/website/reviews`);
      setReviews(res.data);
    } catch (err) {
      setFormStatus({ ...formStatus, review: 'Erreur lors de l\'envoi.' });
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/website/reservations`, reservationForm);
      setFormStatus({ ...formStatus, reservation: 'Réservation envoyée !' });
      setReservationForm({ name: '', phone: '', date: '', time: '', guests: 2 });
    } catch (err) {
      setFormStatus({ ...formStatus, reservation: 'Erreur lors de la réservation.' });
    }
  };

  const toggleTopping = (topping) => {
    setSelectedToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    );
  };

  const totalPrice = selectedProduct
    ? parseFloat(selectedProduct.price) +
    selectedToppings.reduce((acc, t) => acc + parseFloat(t.price), 0) +
    (isMenuSelected ? 20 : 0)
    : 0;

  const drinks = ['Coca-Cola', 'Coca Zero', 'Fanta', 'Sprite', 'Hawaii', 'Pom\'s', 'Eau Minérale'];

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <FloatingIngredients />
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black tracking-tighter text-primary"
          >
            MAMMY'S<span className="text-white"> BURGER</span>
          </motion.div>

          <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-300">
            <a href="#about" className="hover:text-primary transition">{t.about}</a>
            <a href="#menu" className="hover:text-primary transition">{t.menu}</a>
            <a href="#reservation" className="hover:text-primary transition">{t.reservation}</a>
            <a href="#reviews" className="hover:text-primary transition">{t.reviews}</a>
          </div>

          <div className="flex items-center gap-4">
            <select
              className="bg-transparent text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-lg p-1 outline-none"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="fr" className="text-black">FR</option>
              <option value="en" className="text-black">EN</option>
              <option value="ar" className="text-black">AR</option>
            </select>
            <div className="hidden md:block">
              <a href="#reservation" className="px-6 py-2 bg-primary hover:bg-secondary text-black rounded-full text-[10px] font-black transition">
                {t.reservation}
              </a>
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=2072"
            alt="Hero"
            className="w-full h-full object-cover scale-105"
          />
        </div>

        <div className="relative z-20 text-center max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6"
          >
            {t.heroSub}
          </motion.div>
          <div className="flex flex-col items-center">
            <RevealText
              text={t.heroTitle}
              className="text-6xl md:text-9xl font-black leading-[0.8] tracking-tighter justify-center"
            />
            <RevealText
              text={t.heroTitleGradient}
              className="text-6xl md:text-9xl font-black mb-8 leading-[0.8] tracking-tighter justify-center"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium"
          >
            {t.heroDesc}
          </motion.p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#menu" className="px-10 py-4 bg-primary text-black rounded-full font-black text-sm uppercase tracking-tighter hover:bg-white hover:text-black transition-all duration-300">
              {t.viewMenu}
            </a>
            <a href="#reservation" className="px-10 py-4 glass rounded-full font-black text-sm uppercase tracking-tighter hover:bg-white/10 transition-all duration-300">
              {t.bookTable}
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000"
              className="rounded-[3rem] shadow-2xl relative z-10 border border-white/5"
              alt="About Mammy's"
            />
            <div className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl z-20 border border-white/10 hidden lg:block">
              <div className="text-4xl font-black text-primary mb-1">100%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Boeuf Frais</div>
            </div>
          </motion.div>
          <div>
            <RevealText
              text={isAr ? 'قصتنا' : 'NOTRE PASSION'}
              className="text-5xl font-black leading-tight uppercase italic tracking-tighter"
            />
            <RevealText
              text={isAr ? '' : 'DU BURGER'}
              className="text-5xl font-black mb-8 leading-tight uppercase italic tracking-tighter text-primary"
            />
            <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
              Chez Mammy's Burger, nous ne faisons pas que de la nourriture, nous créons des souvenirs. Chaque burger est une œuvre d'art, préparée avec du bœuf sélectionné et des produits locaux de Fès.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-2xl font-black text-white mb-2 italic">ARTISANAL</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pain cuit chaque matin</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white mb-2 italic">LOCAL</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ingrédients de la région</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL MENU */}
      <section id="menu" className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center mb-20">
          <RevealText
            text={isAr ? 'القائمة الرقمية' : 'LE MENU DIGITAL'}
            className="text-6xl font-black mb-4 tracking-tighter uppercase italic justify-center"
          />

          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeCategory === cat.id
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard3D
                key={product.id}
                product={product}
                categories={categories}
                IMG_BASE={IMG_BASE}
                setSelectedProduct={setSelectedProduct}
                t={t}
                isAr={isAr}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-32 relative bg-black">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2">
            <RevealText
              text={isAr ? 'ماذا يقول عملاؤنا' : 'CE QUE DISENT NOS CLIENTS'}
              className="text-5xl font-black mb-12 uppercase italic tracking-tighter flex-wrap"
            />
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.length > 0 ? reviews.map(rev => (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} key={rev.id} className="glass p-8 rounded-3xl relative border border-white/5">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-300 italic mb-6 font-medium leading-relaxed">"{rev.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {rev.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-sm uppercase">{rev.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Client Vérifié</div>
                    </div>
                  </div>
                  <MessageSquare className="absolute top-8 right-8 text-white/5" size={40} />
                </motion.div>
              )) : (
                <div className="text-slate-500 font-bold italic">Aucun avis pour le moment. Soyez le premier !</div>
              )}
            </div>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border border-primary/20 bg-primary/5">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">DONNEZ VOTRE AVIS</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <input
                type="text" placeholder="Votre Nom" required
                value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary outline-none transition"
              />
              <div className="flex items-center gap-4 py-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Note :</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star} type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={reviewForm.rating >= star ? 'text-yellow-500' : 'text-slate-700'}
                    >
                      <Star size={20} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Votre message..." rows="4" required
                value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary outline-none transition"
              ></textarea>
              <button className="w-full py-4 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition flex items-center justify-center gap-2">
                Envoyer <Send size={16} />
              </button>
              {formStatus.review && <p className="text-center text-xs font-bold text-primary">{formStatus.review}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* RESERVATION */}
      <section id="reservation" className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-black">
          <div className="glass p-12 md:p-20 rounded-[3rem] bg-white/20 border border-white/30">
            <div className="text-center mb-12">
              <RevealText
                text={t.reserveTitle}
                className="text-5xl font-black mb-4 tracking-tighter uppercase italic text-black justify-center"
              />
              <p className="text-black font-bold uppercase tracking-widest text-xs opacity-70">{t.reserveSub}</p>
            </div>
            <form onSubmit={handleReservationSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"><Users size={18} /></span>
                  <input
                    type="text" placeholder="Votre Nom" required
                    value={reservationForm.name} onChange={e => setReservationForm({ ...reservationForm, name: e.target.value })}
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:bg-black/10 text-black placeholder:text-black/50 transition font-bold"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"><Phone size={18} /></span>
                  <input
                    type="tel" placeholder="Téléphone" required
                    value={reservationForm.phone} onChange={e => setReservationForm({ ...reservationForm, phone: e.target.value })}
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:bg-black/10 text-black placeholder:text-black/50 transition font-bold"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"><Users size={18} /></span>
                  <select
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:bg-black/10 appearance-none text-black transition font-bold"
                    value={reservationForm.guests} onChange={e => setReservationForm({ ...reservationForm, guests: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n} className="text-black">{n} Personnes</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"><Calendar size={18} /></span>
                  <input
                    type="date" required
                    value={reservationForm.date} onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })}
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:bg-black/10 text-black transition font-bold"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"><Clock size={18} /></span>
                  <input
                    type="time" required
                    value={reservationForm.time} onChange={e => setReservationForm({ ...reservationForm, time: e.target.value })}
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:bg-black/10 text-black transition font-bold"
                  />
                </div>
                <button className="w-full h-[58px] bg-black text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
                  {t.confirmRes}
                </button>
              </div>
              {formStatus.reservation && <p className="md:col-span-2 text-center font-bold text-black mt-4 underline">{formStatus.reservation}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="contact" className="py-32 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <RevealText
              text={isAr ? 'تواصل معنا' : 'NOUS REJOINDRE'}
              className="text-5xl font-black mb-12 uppercase italic tracking-tighter leading-tight flex-wrap"
            />
            <div className="space-y-10">
              <div className="flex gap-6 group">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm mb-2 tracking-widest text-slate-500">{t.address}</h4>
                  <p className="text-xl font-bold leading-tight">MAMMY'S BURGER, FÈS, MAROC</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm mb-2 tracking-widest text-slate-500">{t.phone}</h4>
                  <p className="text-xl font-bold leading-tight">+212 7 06 19 14 08</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                  <Clock size={28} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm mb-2 tracking-widest text-slate-500">{t.hours}</h4>
                  <p className="text-xl font-bold leading-tight">LUN - DIM: 12:00 - 01:00</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[3rem] overflow-hidden h-[500px] glass border border-white/10 relative shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.589139818816!2d-4.99698322409748!3d34.02398081903673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f8b8e7baeebcd%3A0x8f704f910a09abbc!2sMamy's%20Burger!5e0!3m2!1sfr!2sma!4v1746189958748!5m2!1sfr!2sma"
              className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-70"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CUSTOMIZER MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => { setSelectedProduct(null); setIsMenuSelected(false); setSelectedToppings([]); }}
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-4xl glass rounded-[3rem] overflow-hidden grid md:grid-cols-2 shadow-2xl"
            >
              <div className="h-full relative overflow-hidden">
                <img src={`${IMG_BASE}${selectedProduct.image_url}`} className="w-full h-full object-cover scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                  <h2 className="text-4xl font-black italic uppercase text-primary tracking-tighter">{selectedProduct.name}</h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mt-2">Customizer Premium</p>
                </div>
              </div>
              <div className="p-10 flex flex-col bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Personnalisation</h3>
                  <button onClick={() => { setSelectedProduct(null); setIsMenuSelected(false); setSelectedToppings([]); }} className="p-2 glass rounded-full hover:bg-white/10 transition"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6 max-h-[450px] custom-scrollbar">
                  {/* OPTION MENU */}
                  <div className={`p-6 rounded-[2rem] border-2 transition-all ${isMenuSelected ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
                    <div
                      onClick={() => setIsMenuSelected(!isMenuSelected)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isMenuSelected ? 'border-primary bg-primary shadow-lg shadow-primary/20' : 'border-white/30'}`}>
                          {isMenuSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <div>
                          <span className="font-black uppercase text-sm block tracking-tighter">Passer en Menu Combo</span>
                          <span className="text-[10px] opacity-60 font-bold tracking-widest">+ FRITES & BOISSON</span>
                        </div>
                      </div>
                      <span className="font-black text-primary underline underline-offset-4">+20 DH</span>
                    </div>

                    {isMenuSelected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 space-y-6 pt-6 border-t border-white/10">
                        {/* Boisson */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3 italic">Choix de la boisson</label>
                          <div className="flex flex-wrap gap-2">
                            {drinks.map(drink => (
                              <button
                                key={drink}
                                onClick={() => setSelectedDrink(drink)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition border ${selectedDrink === drink ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
                              >
                                {drink}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Accompagnement */}
                        <div>
                          <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3 italic">Choix de l'accompagnement</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setSelectedSide('Frites')}
                              className={`py-3 rounded-xl font-black text-xs transition border ${selectedSide === 'Frites' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}
                            >
                              Frites
                            </button>
                            <button
                              onClick={() => setSelectedSide('Potatoes')}
                              className={`py-3 rounded-xl font-black text-xs transition border ${selectedSide === 'Potatoes' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}
                            >
                              Potatoes
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-2 pb-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Suppléments Toppings</div>

                  {toppings.map(topping => {
                    const isSelected = selectedToppings.find(t => t.id === topping.id);
                    return (
                      <div
                        key={topping.id}
                        onClick={() => toggleTopping(topping)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all ${isSelected ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <img src={`${IMG_BASE}${topping.image_url}`} className="w-12 h-12 object-contain group-hover:scale-110 transition" />
                          <span className="font-black uppercase text-sm tracking-tighter">{topping.name}</span>
                        </div>
                        <span className={`font-black ${isSelected ? 'text-black' : 'text-primary'}`}>+{topping.price} DH</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 italic">Total à régler</div>
                    <div className="text-4xl font-black text-primary underline underline-offset-8">{totalPrice} <span className="text-sm">DH</span></div>
                  </div>
                  <button className="px-10 py-4 bg-primary text-black rounded-full font-black text-sm uppercase tracking-tighter hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20">
                    AJOUTER
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-3xl font-black tracking-tighter text-primary mb-8 italic">
            MAMMY'S<span className="text-white"> BURGER</span>
          </div>
          <div className="flex justify-center gap-8 mb-12">
            <a href="https://www.instagram.com/mamysburgers/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300 shadow-xl"><Instagram size={20} /></a>
            <a href="https://www.facebook.com/burgermamys/?locale=fr_FR" target="_blank" rel="noopener noreferrer" className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-300 shadow-xl"><Facebook size={20} /></a>
          </div>
          <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-t border-white/5 pt-8">
            © 2026 Mammy's Burger. Design Premium par Antigravity. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
