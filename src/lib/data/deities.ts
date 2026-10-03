export interface Mantra {
  sanskrit: string;
  roman: string;
  meaning: string;
}

export interface Deity {
  id: string;
  name: string;
  titleHindi: string;
  image: string;
  themeGlow: string;
  intro: string;
  katha: string;
  mantras: Mantra[];
}

export const deities: Record<string, Deity> = {
  saraswati: {
    id: 'saraswati',
    name: 'Saraswati',
    titleHindi: '??? ???????',
    image: '/saraswati.png',
    themeGlow: 'from-amber-400/50 via-yellow-500/40 to-orange-500/50',
    intro: 'Maa Saraswati is the Hindu goddess of knowledge, music, art, speech, wisdom, and learning. She represents the free flow of wisdom and consciousness.',
    katha: 'According to Hindu tradition, Saraswati was born from the mouth of Brahma, the creator. She is often depicted wearing pure white, seated on a white lotus, playing the Veena. Her four hands represent the four aspects of human personality in learning: mind, intellect, alertness, and ego. She rides a swan (Hamsa), symbolizing the ability to separate good from evil.',
    mantras: [
      {
        sanskrit: '? ?? ????????? ???',
        roman: 'Om Aing Saraswatyai Namah',
        meaning: 'I bow down to Goddess Saraswati.'
      },
      {
        sanskrit: '?? ?????????????????????? ?? ?????????????????\n?? ??????????????????? ?? ??????????????',
        roman: 'Ya Kundendu tushara haaradhavala, Ya shubhravastravrita,\nYa veenavara dandamanditakara, Ya shveta padmasana.',
        meaning: 'Salutations to the Goddess who is pure white like jasmine, with the coolness of Moon, brightness of Snow and shine like the garland of Pearls; who is covered with pure white garments, whose hands are adorned with Veena and the boon-giving staff, and who is seated on a pure white Lotus.'
      }
    ]
  },
  ganesh: {
    id: 'ganesh',
    name: 'Ganesh',
    titleHindi: '????? ????',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ganesha_Om.svg/512px-Ganesha_Om.svg.png', // Temporary SVG placeholder
    themeGlow: 'from-orange-500/50 via-red-500/40 to-yellow-500/50',
    intro: 'Lord Ganesha is the widely revered remover of obstacles, the patron of arts and sciences, and the deva of intellect and wisdom.',
    katha: 'Ganesha was created by Goddess Parvati from turmeric paste to guard her door. When Shiva returned and was denied entry by Ganesha, a battle ensued resulting in Ganesha losing his head. To console a heartbroken Parvati, Shiva replaced Ganesha\'s head with that of an elephant, blessing him to be worshipped first in every new undertaking.',
    mantras: [
      {
        sanskrit: '? ?? ?????? ???',
        roman: 'Om Gam Ganapataye Namaha',
        meaning: 'I bow down to the almighty Ganesha.'
      },
      {
        sanskrit: '????????? ?????? ????????? ???????\n?????????? ???? ?? ??? ???????????? ???????',
        roman: 'Vakratunda Mahakaya Surya Koti Samaprabha,\nNirvighnam Kuru Me Deva Sarva Karyeshu Sarvada.',
        meaning: 'O Lord with a curved trunk and a massive body, whose splendor is equal to millions of suns, please bless me so that I do not face any obstacles in my endeavors.'
      }
    ]
  },
  shiva: {
    id: 'shiva',
    name: 'Shiva',
    titleHindi: '????? ???',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Om_symbol.svg/512px-Om_symbol.svg.png',
    themeGlow: 'from-blue-500/50 via-cyan-500/40 to-indigo-500/50',
    intro: 'Lord Shiva is the Supreme Being in Shaivism. He is the destroyer and transformer within the Trimurti, representing pure consciousness and cosmic meditation.',
    katha: 'Shiva is often portrayed as an ascetic yogi on Mount Kailash, as well as a householder with Goddess Parvati and his two children, Ganesha and Kartikeya. He swallowed the Halahala poison churned from the cosmic ocean to save the universe, earning the name Neelakantha (The Blue-Throated One).',
    mantras: [
      {
        sanskrit: '? ??? ?????',
        roman: 'Om Namah Shivaya',
        meaning: 'I bow to Lord Shiva / I bow to my inner self.'
      },
      {
        sanskrit: '?????????? ?????? ???????? ??????????????\n??????????? ??????????????????????? ??????????',
        roman: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam,\nUrvarukamiva Bandhanan Mrityormukshiya Maamritat.',
        meaning: 'We worship the Three-eyed Lord who is fragrant and who nourishes all beings. May He liberate us from death for the sake of immortality, even as a cucumber is severed from its bondage to the creeper.'
      }
    ]
  },
  krishna: {
    id: 'krishna',
    name: 'Krishna',
    titleHindi: '????? ?????',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Aum_Om_red.svg/512px-Aum_Om_red.svg.png',
    themeGlow: 'from-blue-400/50 via-purple-500/40 to-pink-500/50',
    intro: 'Lord Krishna is the eighth avatar of Vishnu, revered as the supreme deity in Hinduism. He is the embodiment of love, joy, and divine wisdom.',
    katha: 'Krishna was born in Mathura to Devaki and Vasudeva. He gave the discourse of the Bhagavad Gita on the battlefield of Kurukshetra to Prince Arjuna, teaching the paths of Bhakti, Karma, and Jnana yoga.',
    mantras: [
      {
        sanskrit: '? ??? ????? ?????????',
        roman: 'Om Namo Bhagavate Vasudevaya',
        meaning: 'Obeisance to the Supreme Lord Vasudeva (Krishna).'
      }
    ]
  },
  hanuman: {
    id: 'hanuman',
    name: 'Hanuman',
    titleHindi: '????? ??????',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Om_symbol_in_Devanagari.svg/512px-Om_symbol_in_Devanagari.svg.png',
    themeGlow: 'from-red-500/50 via-orange-500/40 to-yellow-500/50',
    intro: 'Lord Hanuman is the greatest devotee of Lord Rama. He symbolizes strength, devotion, and selfless service.',
    katha: 'Hanuman leaped across the ocean to Lanka to find Mata Sita. He carried the Sanjeevani mountain to save Lakshmana\'s life and is considered an immortal (Chiranjeevi) who protects his devotees from negativity.',
    mantras: [
      {
        sanskrit: '? ?? ?????? ???',
        roman: 'Om Hum Hanumate Namaha',
        meaning: 'I bow to Lord Hanuman.'
      }
    ]
  },
  durga: {
    id: 'durga',
    name: 'Durga',
    titleHindi: '??? ??????',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Om_symbol.svg/512px-Om_symbol.svg.png',
    themeGlow: 'from-red-600/50 via-rose-500/40 to-pink-600/50',
    intro: 'Maa Durga is the principal form of the Mother Goddess, associated with protection, strength, motherhood, and the destruction of evil.',
    katha: 'Durga was created by the combined anger and power of the Trimurti to slay the buffalo demon Mahishasura. She rides a lion or tiger, carrying weapons given by all the gods.',
    mantras: [
      {
        sanskrit: '?????????????????? ???? ???????????????\n?????? ?????????? ???? ??????? ???????? ???',
        roman: 'Sarva Mangala Mangalye Shive Sarvartha Sadhike,\nSharanye Tryambake Gauri Narayani Namostu Te.',
        meaning: 'To the auspiciousness of all that is auspicious, to the accomplisher of all objectives, to the source of refuge, to the three-eyed Goddess Gauri, I bow to You.'
      }
    ]
  },
  lakshmi: {
    id: 'lakshmi',
    name: 'Lakshmi',
    titleHindi: '??? ???????',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Aum_Om_red.svg/512px-Aum_Om_red.svg.png',
    themeGlow: 'from-pink-500/50 via-rose-400/40 to-red-400/50',
    intro: 'Maa Lakshmi is the goddess of wealth, fortune, power, beauty, fertility, and prosperity.',
    katha: 'Lakshmi emerged from the churning of the cosmic ocean (Samudra Manthan) and chose Vishnu as her eternal consort. She incarnates alongside him in all his avatars (like Sita with Rama, and Rukmini with Krishna).',
    mantras: [
      {
        sanskrit: '? ????? ????? ????? ???????????? ???',
        roman: 'Om Shreem Hreem Kleem Mahalakshmyai Namah',
        meaning: 'I bow to Goddess Mahalakshmi.'
      }
    ]
  },
  ram: {
    id: 'ram',
    name: 'Ram',
    titleHindi: '????? ???',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ganesha_Om.svg/512px-Ganesha_Om.svg.png',
    themeGlow: 'from-orange-400/50 via-amber-500/40 to-yellow-500/50',
    intro: 'Lord Rama is the seventh avatar of Vishnu, representing Maryada Purushottam (the perfect man/supreme lord of righteousness).',
    katha: 'Rama\'s life is chronicled in the epic Ramayana. He went into a 14-year exile to honor his father\'s word, defeated the demon king Ravana to rescue his wife Sita, and established Ram Rajya, a period of perfect peace and justice.',
    mantras: [
      {
        sanskrit: '???? ??? ?? ??? ?? ?? ???',
        roman: 'Shri Ram Jaya Ram Jaya Jaya Ram',
        meaning: 'Victory to Lord Rama.'
      }
    ]
  }
};

export const getAllDeities = () => Object.values(deities);
export const getDeity = (id: string) => deities[id];
