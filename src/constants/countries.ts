import { Country } from '../types';

// Comprehensive list of ALL countries in the world alphabetically
export const countries: Country[] = [
  {
    name: 'Afghanistan',
    code: 'AF',
    states: [
      { name: 'Kabul', localGovernments: ['Kabul City', 'Paghman', 'Deh Sabz'] },
      { name: 'Herat', localGovernments: ['Herat City', 'Guzara', 'Injil'] },
      { name: 'Kandahar', localGovernments: ['Kandahar City', 'Daman', 'Arghandab'] }
    ]
  },
  {
    name: 'Albania',
    code: 'AL',
    states: [
      { name: 'Tirana', localGovernments: ['Tirana Municipality', 'Kamëz', 'Vorë'] },
      { name: 'Durrës', localGovernments: ['Durrës Municipality', 'Krujë', 'Shijak'] }
    ]
  },
 {
  name: 'Algeria',
  code: 'DZ',
  states: [
    {
      name: 'Adrar',
      localGovernments: ['Adrar', 'Aoulef', 'Aregui', 'Bouda', 'Fenoughil', 'In Zghmir', 'Ksar Kaddour', 'Metarfa', 'Ouled Ahmed Timmi', 'Ouled Aissa', 'Ouled Said', 'Ouled Yagoub', 'Sali', 'Sebaa', 'Talmine', 'Tamantit', 'Tamest', 'Timiaouine', 'Timoktene', 'Tinerkouk', 'Tsabit', 'Zaouiet Kounta']
    },
    {
      name: 'Chlef',
      localGovernments: ['Chlef', 'Abou El Hassan', 'Aïn Merane', 'Beni Bouateb', 'Beni Haoua', 'Beni Rached', 'Boukadir', 'Bouzghaia', 'Breira', 'Chettia', 'Dahra', 'El Hadjadj', 'El Karimia', 'El Marsa', 'Harenfa', 'Labiod Medjadja', 'Moussadek', 'Oued Fodda', 'Oued Goussine', 'Oued Sly', 'Ouled Abbes', 'Ouled Ben Abdelkader', 'Ouled Fares', 'Sendjas', 'Sidi Abderrahmane', 'Sidi Akkacha', 'Sobha', 'Tadjena', 'Talassa', 'Taougrite', 'Ténès', 'Zeboudja']
    },
    {
      name: 'Laghouat',
      localGovernments: ['Laghouat', 'Aflou', 'Aïn Madhi', 'Bennacer Benchohra', 'Brida', 'El Assafia', 'El Ghicha', 'Gueltat Sidi Saad', 'Hadj Mechri', 'Kheneg', 'Ksar El Hirane', 'Oued Morra', 'Oued M\'Zi', 'Sidi Bouzid', 'Sidi Makhlouf', 'Tadjemout', 'Tadjrouna', 'Taouiala']
    },
    {
      name: 'Oum El Bouaghi',
      localGovernments: ['Oum El Bouaghi', 'Aïn Babouche', 'Aïn Beida', 'Aïn Diss', 'Aïn Fakroun', 'Aïn Kercha', 'Aïn M\'Lila', 'Behir Chergui', 'Berriche', 'Bir Chouhada', 'Dhalaa', 'El Amiria', 'El Belala', 'El Djazia', 'El Fedjoudj', 'El Harmilia', 'Fkirina', 'Hanchir Toumghani', 'Ksar Sbahi', 'Meskiana', 'Oued Nini', 'Ouled Gacem', 'Ouled Hamla', 'Ouled Zouai', 'Rahia', 'Sigus', 'Souk Naamane', 'Zorg']
    },
    {
      name: 'Batna',
      localGovernments: ['Batna', 'Aïn Djasser', 'Aïn Touta', 'Arris', 'Barika', 'Bouzina', 'Chemora', 'Djezar', 'El Madher', 'Fesdis', 'Ghassira', 'Hidoussa', 'Ichmoul', 'Lazrou', 'Menaa', 'Merouana', 'Ngaous', 'Oued Chaaba', 'Oued El Ma', 'Oued Taga', 'Ras El Aioun', 'Seggana', 'Seriana', 'Tazoult', 'Timgad', 'Zanat El Beida']
    },
    {
      name: 'Béjaïa',
      localGovernments: ['Béjaïa', 'Adekar', 'Aït R\'Zine', 'Aït Smail', 'Akbou', 'Akfadou', 'Amalou', 'Amizour', 'Aokas', 'Barbacha', 'Boudjellil', 'Bouhamza', 'Boukhelifa', 'Chellata', 'Chemini', 'Darguina', 'Draâ El Kaïd', 'El Kseur', 'Fenaïa Ilmaten', 'Ferraoun', 'Ighil Ali', 'Kendira', 'Kherrata', 'Leflaye', 'M\'Cisna', 'Oued Ghir', 'Ouzellaguen', 'Seddouk', 'Sidi Aïch', 'Smaoun', 'Souk El Tenine', 'Tala Hamza', 'Tamokra', 'Tamridjet', 'Taourirt', 'Tazmalt', 'Tichy', 'Tifra', 'Timezrit', 'Tinebdar', 'Tizi N\'Berber', 'Toudja']
    },
    {
      name: 'Biskra',
      localGovernments: ['Biskra', 'Aïn Naga', 'Aïn Zaatout', 'Bordj Ben Azzouz', 'Bouchagroune', 'Branis', 'Chetma', 'Djemorah', 'Doucen', 'Ech Chaiba', 'El Feidh', 'El Ghrous', 'El Hadjab', 'El Haouch', 'El Kantara', 'El Outaya', 'Foughala', 'Khenguet Sidi Nadji', 'Lichana', 'Lioua', 'M\'Chouneche', 'M\'Lili', 'Meziraa', 'Ouled Djellal', 'Oumache', 'Ourlal', 'Sidi Khaled', 'Sidi Okba', 'Tolga', 'Zeribet El Oued']
    },
    {
      name: 'Béchar',
      localGovernments: ['Béchar', 'Abadla', 'Béni Abbès', 'Béni Ikhlef', 'Béni Ounif', 'El Ouata', 'Igli', 'Kenadsa', 'Kerzaz', 'Ksabi', 'Lahmar', 'Machraa Houari Boumediene', 'Mogheul', 'Ouled Khodeïr', 'Tabalbala', 'Taghit', 'Tamtert', 'Timoudi']
    },
    {
      name: 'Blida',
      localGovernments: ['Blida', 'Affroun', 'Aïn Romana', 'Beni Mered', 'Beni Tamou', 'Bouarfa', 'Boufarik', 'Bougara', 'Bouinan', 'Chebli', 'Chiffa', 'Chréa', 'El Affroun', 'Guerrouaou', 'Hammam Melouane', 'Larbaa', 'Meftech', 'Mouzaïa', 'Oued Djer', 'Oued El Alleug', 'Ouled Slama', 'Ouled Yaich', 'Souhane', 'Soumaa']
    },
    {
      name: 'Bouira',
      localGovernments: ['Bouira', 'Aïn Bessem', 'Ahnif', 'Aïn Laloui', 'Aït Laziz', 'Aomar', 'Ath Mansour', 'Bechloul', 'Bordj Okhriss', 'Bouderbala', 'Boukram', 'Chorfa', 'Dechmia', 'Dirrah', 'Djebahia', 'El Adjiba', 'El Asnam', 'El Hachimia', 'El Khabouzia', 'El Mokrani', 'Guerrouma', 'Hadjera Zerga', 'Haizer', 'Kadiria', 'Lakhdaria', 'Mchedallah', 'Mezdour', 'Oued El Berdi', 'Ouled Rached', 'Raouraoua', 'Ridane', 'Saharidj', 'Sour El Ghozlane', 'Taguedite', 'Taghzout', 'Zbarbar']
    },
    {
      name: 'Tamanrasset',
      localGovernments: ['Tamanrasset', 'Abalessa', 'Foggaret Ezzaouia', 'Idlès', 'In Amguel', 'In Ghar', 'In Salah', 'Tazrouk', 'Tin Zaouatine']
    },
    {
      name: 'Tébessa',
      localGovernments: ['Tébessa', 'Aïn Zerga', 'Bekkaria', 'Bir El Ater', 'Bir Mokkadem', 'Boulhaf Dir', 'Boukhadra', 'El Kouif', 'El Ma Labiodh', 'El Meridj', 'El Ogla', 'Ferkane', 'Guorriguer', 'Morsott', 'Negrine', 'Ouenza', 'Oum Ali', 'Saf Saf El Ouesra', 'Stah Guentis', 'Telidjen']
    },
    {
      name: 'Tlemcen',
      localGovernments: ['Tlemcen', 'Aïn Fezza', 'Aïn Ghoraba', 'Aïn Kebira', 'Aïn Nehala', 'Aïn Tellout', 'Aïn Youcef', 'Amieur', 'Azails', 'Bab El Assa', 'Bensekrane', 'Beni Bahdel', 'Beni Boussaid', 'Beni Mester', 'Beni Ouarsous', 'Beni Smiel', 'Bensekrane', 'Bouhlou', 'Chetouane', 'El Aricha', 'El Bouihi', 'El Fehoul', 'El Gor', 'Fellaoucene', 'Ghazaouet', 'Hammam Boughrara', 'Hennaya', 'Honaine', 'Mansourah', 'Marsa Ben M\'Hidi', 'Msirda Fouaga', 'Nedroma', 'Oued Chouly', 'Ouled Mimoun', 'Ouled Riyah', 'Remchi', 'Sabra', 'Sebbaa Chioukh', 'Sebdou', 'Sidi Abdelli', 'Sidi Djillali', 'Sidi Medjahed', 'Terny Beni Hdiel', 'Zenata']
    },
    {
      name: 'Tiaret',
      localGovernments: ['Tiaret', 'Aïn Bouchekif', 'Aïn Deheb', 'Aïn El Hadid', 'Aïn Kermes', 'Aïn Zarit', 'Bougara', 'Chehaima', 'Dahmouni', 'Djebilet Rosfa', 'Faidja', 'Frenda', 'Guertoufa', 'Hamadia', 'Ksar Chellala', 'Madna', 'Mahdia', 'Mechraa Sfa', 'Medroussa', 'Medrissa', 'Meghila', 'Mellakou', 'Nadorah', 'Naima', 'Oued Lilli', 'Rahouia', 'Rechaiga', 'Sebaine', 'Sebt', 'Serghine', 'Si Abdelghani', 'Sidi Abderrahmane', 'Sidi Ali Mellal', 'Sidi Bakhti', 'Sidi Hosni', 'Sougueur', 'Tagdempt', 'Takhemaret', 'Tousnina', 'Zmalet El Emir Abdelkader']
    },
    {
      name: 'Tizi Ouzou',
      localGovernments: ['Tizi Ouzou', 'Abi Youcef', 'Aghrib', 'Aïn El Hammam', 'Aït Aïssa Mimoun', 'Aït Bouaddou', 'Aït Chafaa', 'Aït Khellili', 'Aït Mahmoud', 'Aït Oumalou', 'Aït Toudert', 'Aït Yahia', 'Aït Yahia Moussa', 'Akbil', 'Azeffoun', 'Azazga', 'Beni Aïssi', 'Beni Douala', 'Beni Yenni', 'Boghni', 'Boudjima', 'Bounouh', 'Bouzeguene', 'Draâ Ben Khedda', 'Draâ El Mizan', 'Freha', 'Frikat', 'Iboudrarene', 'Idjeur', 'Iferhounene', 'Ifigha', 'Iflissen', 'Illilten', 'Illoula Oumalou', 'Imsouhal', 'Irdjen', 'Larbaâ Nath Irathen', 'Mâatkas', 'Makouda', 'Mechtras', 'Mekla', 'Mizrana', 'Ouacif', 'Ouadhia', 'Ouaguenoun', 'Sidi Naamane', 'Souamaâ', 'Souk El Thenine', 'Tadmaït', 'Tigzirt', 'Timizart', 'Tirmitine', 'Tizi Gheniff', 'Tizi N\'Tleta', 'Yakourene', 'Zekri']
    },
    {
      name: 'Algiers',
      localGovernments: [
        'Sidi M\'Hamed', 'Bab El Oued', 'Casbah', 'Bologhine', 'Oued Koriche', 'Bir Mourad Raïs', 'El Biar', 'Bouzareah', 'Birkhadem', 
        'El Harrach', 'Baraki', 'Oued Smar', 'Bourouba', 'Hussein Dey', 'Kouba', 'Mohammadia', 'Hamma Annassers', 'Maison Carrée',
        'Mohamed Belouizdad', 'Rais Hamidou', 'Dar El Beïda', 'Bab Ezzouar', 'Bordj El Kiffan', 'El Marsa', 'Aïn Taya', 'Bordj El Bahri',
        'El Djazaïr', 'Bachdjerrah', 'Ouled Chebel', 'Tessala El Merdja', 'Haraoua', 'Rouïba', 'Reghaïa', 'Birtouta', 'Ouled Fayet',
        'Tessala', 'Zeralda', 'Mahelma', 'Rahmania', 'Souidania', 'Staoueli', 'Cheraga', 'Dely Ibrahim', 'El Achour', 'Draria'
      ]
    },
    {
      name: 'Djelfa',
      localGovernments: ['Djelfa', 'Aïn Chouhada', 'Aïn El Ibel', 'Aïn Fekka', 'Aïn Maabed', 'Aïn Oussera', 'Amourah', 'Beni Yagoub', 'Birine', 'Bouira Lahdab', 'Charef', 'Dar Chioukh', 'Deldoul', 'Douis', 'El Guedid', 'El Idrissia', 'Faidh El Botma', 'Guernini', 'Guettara', 'Had Sahary', 'Hassi Bahbah', 'Hassi El Euch', 'Hassi Fedoul', 'Messaad', 'Moudjebara', 'Oum Laadham', 'Sed Rahal', 'Selmana', 'Sidi Baizid', 'Sidi Ladjel', 'Tadmit', 'Zaafrane', 'Zaccar']
    },
    {
      name: 'Jijel',
      localGovernments: ['Jijel', 'Aïn Afra', 'Aïn El Kebira', 'Aïn Oulmene', 'Aïn Regada', 'Aïn Roua', 'Bordj T\'har', 'Boudria Beni Yadjis', 'Bouraoui Belhadef', 'Boussif Ouled Askeur', 'Chahna', 'Chekfa', 'Djemaa Beni Habibi', 'El Aouana', 'El Ancer', 'El Kennar Nouchfi', 'Emir Abdelkader', 'Erraguene', 'Ghebala', 'Jemaa Ouled Cheikh', 'Kaous', 'Kheïri Oued Adjoul', 'Oudjana', 'Ouled Rabah', 'Ouled Yahia Khadrouch', 'Selma Benziada', 'Settara', 'Sidi Abdelaziz', 'Sidi Marouf', 'Taher', 'Texenna', 'Ziama Mansouriah']
    },
    {
      name: 'Sétif',
      localGovernments: ['Sétif', 'Aïn Abessa', 'Aïn Azel', 'Aïn El Kebira', 'Aïn Lahdjar', 'Aïn Legraj', 'Aïn Oulmene', 'Aïn Roua', 'Aïn Sebt', 'Amoucha', 'Babor', 'Bazer Sakhra', 'Beidha Bordj', 'Belaa', 'Beni Aziz', 'Beni Chebana', 'Beni Fouda', 'Beni Hocine', 'Beni Ourtilane', 'Bir El Arch', 'Bir Haddada', 'Bouandas', 'Bougaa', 'Bousselam', 'Boutaleb', 'Dehamcha', 'Djemila', 'Draâ Kebila', 'El Eulma', 'El Ouldja', 'Guellal', 'Guelta Zerka', 'Guenzet', 'Guidjel', 'Hamma', 'Harbil', 'Ksar El Abtal', 'Maaouia', 'Maoklane', 'Mezloug', 'Ouled Addouane', 'Ouled Sabor', 'Ouled Si Ahmed', 'Ouled Tebben', 'Rasfa', 'Salah Bey', 'Serdj El Ghoul', 'Tachouda', 'Tala Ifacene', 'Taya', 'Tella', 'Tizi N\'Bechar']
    },
    {
      name: 'Saïda',
      localGovernments: ['Saïda', 'Aïn El Hadjar', 'Aïn Sekhouna', 'Aïn Soltane', 'Doui Thabet', 'El Hassasna', 'Hounet', 'Maamora', 'Moulay Larbi', 'Ouled Brahim', 'Ouled Khaled', 'Sidi Ahmed', 'Sidi Amar', 'Sidi Boubekeur', 'Tircine', 'Youb']
    },
    {
      name: 'Skikda',
      localGovernments: ['Skikda', 'Aïn Bouziane', 'Aïn Charchar', 'Aïn Kechra', 'Aïn Zouit', 'Azzaba', 'Ben Azzouz', 'Beni Bechir', 'Beni Oulbane', 'Beni Zid', 'Bin El Ouiden', 'Bouchetata', 'Cheraia', 'Collo', 'Djendel Saadi Mohamed', 'El Ghedir', 'El Hadaik', 'El Harrouch', 'El Marsa', 'Emdjez Edchich', 'Es Sebt', 'Filfila', 'Hamadi Krouma', 'Kanoua', 'Kerkera', 'Kheneg Mayoum', 'Oued Zhour', 'Ouled Attia', 'Ouled Habbaba', 'Oum Toub', 'Ramdane Djamel', 'Salah Bouchaour', 'Sidi Mezghiche', 'Tamalous', 'Zerdazas', 'Zitouna']
    },
    {
      name: 'Sidi Bel Abbès',
      localGovernments: ['Sidi Bel Abbès', 'Aïn Adden', 'Aïn El Berd', 'Aïn Kada', 'Aïn Thrid', 'Aïn Tindamine', 'Amarnas', 'Badredine El Mokrani', 'Belarbi', 'Ben Badis', 'Benachiba Chelia', 'Bir El Hammam', 'Boudjebaa El Bordj', 'Boukhanafis', 'Chetouane Belaila', 'Dhaya', 'El Hacaiba', 'Hassi Dahou', 'Hassi Zahana', 'Lamtar', 'Makedra', 'Marhoum', 'Mechraa Houari Boumediene', 'Mefatih', 'Merine', 'Mezaourou', 'Mostefa Ben Brahim', 'Moulay Slissen', 'Oued Sebaa', 'Oued Sefioun', 'Oued Taourira', 'Ras El Ma', 'Redjem Demouche', 'Sehala Thaoura', 'Sfisef', 'Sidi Ali Benyoub', 'Sidi Ali Boussidi', 'Sidi Brahim', 'Sidi Chaib', 'Sidi Dahou Zairs', 'Sidi Hamadouche', 'Sidi Khaled', 'Sidi Lahcene', 'Sidi Yacoub', 'Tabia', 'Tafissour', 'Tagdemt', 'Tenira', 'Tessala', 'Tilmouni', 'Zerouala']
    },
    {
      name: 'Annaba',
      localGovernments: ['Annaba', 'Aïn Berda', 'Berrahal', 'Cheurfa', 'Chetaïbi', 'Echatt', 'El Bouni', 'El Hadjar', 'Oued El Aneb', 'Seraïdi', 'Sidi Amar']
    },
    {
      name: 'Guelma',
      localGovernments: ['Guelma', 'Aïn Ben Beida', 'Aïn Larbi', 'Aïn Makhlouf', 'Aïn Reggada', 'Aïn Sandel', 'Belkheir', 'Bendjarah', 'Ben Djarah', 'Bou Hachana', 'Bou Hamdane', 'Bouati Mahmoud', 'Bouchegouf', 'Boumahra Ahmed', 'Dahouara', 'Djeballah Khemissi', 'El Fedjoudj', 'Guellat Bou Sbaa', 'Hammam Debagh', 'Hammam Maskhoutine', 'Hammam N\'Bails', 'Heliopolis', 'Khezara', 'Medjez Amar', 'Medjez Sfa', 'Nechmaya', 'Oued Cheham', 'Oued Fragha', 'Oued Zenati', 'Ras El Agba', 'Roknia', 'Sellaoua Announa', 'Tamlouka']
    },
    {
      name: 'Constantine',
      localGovernments: ['Constantine', 'Aïn Abid', 'Aïn El Bey', 'Aïn Kerma', 'Aïn Smara', 'Ben Badis', 'Didouche Mourad', 'El Khroub', 'Hamma Bouziane', 'Ibn Ziad', 'Messaoud Boudjeriou', 'Ouled Rahmoune', 'Zighoud Youcef']
    },
    {
      name: 'Médéa',
      localGovernments: ['Médéa', 'Aïn Boucif', 'Aïn Ou Ksir', 'Aziz', 'Baata', 'Benchicao', 'Beni Slimane', 'Berrouaghia', 'Boghar', 'Bou Aiche', 'Bouaichoune', 'Bouchrahil', 'Boughezoui', 'Bouskene', 'Chahbounia', 'Chelalet El Adhaoura', 'Cheniguel', 'Derrag', 'Djouab', 'Draa Essamar', 'El Azizia', 'El Guelb El Kebir', 'El Hamdania', 'El Omaria', 'El Ouinet', 'Hannacha', 'Kef Lakhdar', 'Khams Djouamaa', 'Ksar El Boukhari', 'Mezerana', 'Mihoub', 'Ouamri', 'Oued Harbil', 'Ouzera', 'Rebaia', 'Saneg', 'Sedraya', 'Seghouane', 'Si Mahdjoub', 'Sidi Demed', 'Sidi Naamane', 'Souagui', 'Tablat', 'Tafraout', 'Tamesguida', 'Tlatet Eddouair', 'Zoubiria']
    },
    {
      name: 'Mostaganem',
      localGovernments: ['Mostaganem', 'Aïn Boudinar', 'Aïn Nouïssy', 'Aïn Sidi Cherif', 'Aïn Tadles', 'Benabdelmalek Ramdane', 'Bouguirat', 'Fornaka', 'Hacine', 'Hadjadj', 'Hassi Mameche', 'Kheireddine', 'Khadema', 'Mansourah', 'Mazagran', 'Mesra', 'Nekmaria', 'Oued El Kheir', 'Ouled Boughalem', 'Ouled Maallah', 'Safsaf', 'Sayada', 'Sidi Ali', 'Sidi Belattar', 'Sidi Lakhdar', 'Sirat', 'Souaflia', 'Sour', 'Stidia', 'Tazgait', 'Touahria']
    },
    {
      name: 'M\'Sila',
      localGovernments: ['M\'Sila', 'Aïn El Hadjel', 'Aïn El Melh', 'Aïn Fares', 'Aïn Khadra', 'Belaïba', 'Ben Srour', 'Berhoum', 'Bir Foda', 'Bouti Sayeh', 'Chellal', 'Dehahna', 'Djebel Messaad', 'El Hamel', 'El Houamed', 'Hammam Dhalaa', 'Khettouti Sed El Jou', 'Khoubana', 'Maadid', 'Maarif', 'Magra', 'M\'Cif', 'M\'Tarfa', 'Médjedel', 'Mohamed Boudiaf', 'Ouanougha', 'Ouled Addi Guebala', 'Ouled Derradj', 'Ouled Madhi', 'Ouled Mansour', 'Ouled Sidi Brahim', 'Oultem', 'Sidi Aïssa', 'Sidi Ameur', 'Sidi Hadjeres', 'Slim', 'Souamaa', 'Tamsa', 'Tarmount', 'Zarzour']
    },
    {
      name: 'Mascara',
      localGovernments: ['Mascara', 'Aïn Fares', 'Aïn Fekan', 'Aïn Ferah', 'Aïn Frass', 'Alaimia', 'Aouf', 'Benian', 'Bou Hanifia', 'Bou Henni', 'Chorfa', 'El Bordj', 'El Gaada', 'El Ghomri', 'El Gueitena', 'El Hachem', 'El Keurt', 'El Menaouer', 'Ferraguig', 'Froha', 'Gharrous', 'Guerdjoum', 'Hachem', 'Khalouia', 'Makdha', 'Maoussa', 'Mamounia', 'Matemore', 'Mocta Douz', 'Mohammadia', 'Nesmot', 'Oggaz', 'Oued El Abtal', 'Oued Taria', 'Ras El Aïn Amirouche', 'Sedjerara', 'Sehailia', 'Sidi Abdeldjebar', 'Sidi Abdelmoumen', 'Sidi Boussaid', 'Sidi Kada', 'Sig', 'Tighennif', 'Tizi', 'Zahana', 'Zelamta']
    },
    {
      name: 'Ouargla',
      localGovernments: ['Ouargla', 'Aïn Beida', 'Benaceur', 'Blidet Amor', 'El Allia', 'El Borma', 'El Hadjira', 'Hassi Ben Abdellah', 'Hassi Messaoud', 'Megarine', 'N\'Goussa', 'Rouissat', 'Sidi Khouiled', 'Taïbet', 'Tebesbest', 'Touggourt']
    },
    {
      name: 'Oran',
      localGovernments: [
        'Oran', 'Aïn El Turk', 'Arzew', 'Ben Freha', 'Bethioua', 'Bir El Djir', 'Boufatis', 'Bousfer', 'El Ançor', 'El Braya', 
        'El Kerma', 'Es Senia', 'Gdyel', 'Hassi Bounif', 'Hassi Ben Okba', 'Hassi Mefsoukh', 'Mers El Kébir', 'Messerghin', 
        'M\'Sila', 'Oued Tlelat', 'Sidi Ben Yebka', 'Sidi Chami', 'Tafraoui'
      ]
    },
    {
      name: 'El Bayadh',
      localGovernments: ['El Bayadh', 'Arbaouat', 'Boualem', 'Bougtoub', 'Boussemghoun', 'Brezina', 'Cheguig', 'Chellala', 'El Abiodh Sidi Cheikh', 'El Bnoud', 'El Kheiter', 'El Mehara', 'Ghassoul', 'Kef El Ahmar', 'Krakda', 'Rogassa', 'Sidi Ameur', 'Sidi Slimane', 'Sidi Tifour', 'Stitten', 'Tousmouline']
    },
    {
      name: 'Illizi',
      localGovernments: ['Illizi', 'Bordj Omar Driss', 'Debdeb', 'In Amenas']
    },
    {
      name: 'Bordj Bou Arréridj',
      localGovernments: ['Bordj Bou Arréridj', 'Aïn Taghrout', 'Belimour', 'Ben Daoud', 'Bir Kasdali', 'Bordj Ghedir', 'Bordj Zemmoura', 'Colla', 'Djaafra', 'El Ach', 'El Achir', 'El Anseur', 'El Hamadia', 'El Main', 'El M\'Hir', 'Ghilassa', 'Haraza', 'Hasnaoua', 'Khelil', 'Ksour', 'Mansoura', 'Medjana', 'Ouled Brahem', 'Ouled Dahmane', 'Ouled Sidi Brahim', 'Rabta', 'Ras El Oued', 'Sidi Embarek', 'Taglait', 'Teniet En Nasr', 'Tefreg', 'Tixter']
    },
    {
      name: 'Boumerdès',
      localGovernments: ['Boumerdès', 'Afir', 'Aïn El Assel', 'Aïn Taya', 'Baghlia', 'Ben Choud', 'Beni Amrane', 'Bordj Menaïel', 'Boudouaou', 'Boudouaou El Bahri', 'Bouzegza Keddara', 'Chabet El Ameur', 'Corso', 'Dellys', 'Djinet', 'El Kharrouba', 'Hammedi', 'Isser', 'Khemis El Khechna', 'Larbatache', 'Leghata', 'Naciria', 'Ouled Aissa', 'Ouled Hedadj', 'Ouled Moussa', 'Si Mustapha', 'Sidi Daoud', 'Souk El Had', 'Taourga', 'Thenia', 'Tidjelabine', 'Timezrit', 'Zemmouri']
    },
    {
      name: 'El Tarf',
      localGovernments: ['El Tarf', 'Aïn El Assel', 'Aïn Kerma', 'Asfour', 'Ben M\'Hidi', 'Berrihane', 'Besbes', 'Bouhadjar', 'Bouteldja', 'Chebaita Mokhtar', 'Chefia', 'Chihani', 'Dréan', 'Echatt', 'El Aioun', 'El Kala', 'Hammam Beni Salah', 'Lac Des Oiseaux', 'Oued Zitoun', 'Raml Souk', 'Souarekh', 'Zerizer', 'Zitouna']
    },
    {
      name: 'Tindouf',
      localGovernments: ['Tindouf', 'Oum El Assel']
    },
    {
      name: 'Tissemsilt',
      localGovernments: ['Tissemsilt', 'Ammari', 'Bordj Bou Naama', 'Bordj El Emir Abdelkader', 'Boucaid', 'Khemisti', 'Larbaa', 'Lardjem', 'Layoune', 'Lazharia', 'Maacem', 'Melaab', 'Ouled Bessem', 'Sidi Abed', 'Sidi Boutouchent', 'Sidi Lantri', 'Sidi Slimane', 'Tamalaht', 'Théniet El Had', 'Tissemsilt', 'Youssoufia']
    },
    {
      name: 'El Oued',
      localGovernments: ['El Oued', 'Bayadha', 'Ben Guecha', 'Debila', 'Djamaa', 'Douar El Ma', 'El Ogla', 'Guemar', 'Hassani Abdelkrim', 'Hassi Khalifa', 'Kouinine', 'Magrane', 'Mih Ouansa', 'M\'Rara', 'Nakhla', 'Oued El Alenda', 'Oum Touyour', 'Ourmes', 'Reggouba', 'Robbah', 'Sidi Aoun', 'Sidi Khellil', 'Still', 'Taghzout', 'Taleb Larbi', 'Tendla', 'Trifaoui']
    },
    {
      name: 'Khenchela',
      localGovernments: ['Khenchela', 'Aïn Touila', 'Babar', 'Baghai', 'Bouhmama', 'Chelia', 'Djellal', 'El Hamma', 'El Mahmal', 'Ensigha', 'Fais', 'Kais', 'Khirane', 'M\'Sara', 'M\'Toussa', 'Ouled Rechache', 'Remila', 'Tamza', 'Taouzianat', 'Yabous']
    },
    {
      name: 'Souk Ahras',
      localGovernments: ['Souk Ahras', 'Aïn Zana', 'Bir Bouhouche', 'Drea', 'Haddada', 'Hanencha', 'Khedara', 'Khemissa', 'M\'Daourouch', 'Mechroha', 'Merahna', 'Oued Keberit', 'Ouled Driss', 'Ouled Moumen', 'Oum El Adhaïm', 'Ragouba', 'Safel El Ouiden', 'Sedrata', 'Sidi Fredj', 'Taoura', 'Terraguelt', 'Tiffech', 'Zaarouria', 'Zouabi']
    },
    {
      name: 'Tipaza',
      localGovernments: ['Tipaza', 'Aghbal', 'Ahmar El Aïn', 'Aïn Tagourait', 'Attatba', 'Beni Milleuk', 'Bou Haroun', 'Bou Ismaïl', 'Bourkika', 'Chaiba', 'Cherchell', 'Damous', 'Douaouda', 'Fouka', 'Gouraya', 'Hadjout', 'Hadjret Ennous', 'Khemisti', 'Kolea', 'Larhat', 'Menaceur', 'Merad', 'Messelmoun', 'Nador', 'Sidi Amar', 'Sidi Ghiles', 'Sidi Rached', 'Sidi Semiane']
    },
    {
      name: 'Mila',
      localGovernments: ['Mila', 'Aïn Beida Harriche', 'Aïn Mellouk', 'Aïn Tine', 'Amira Arras', 'Benyahia Abderrahmane', 'Bouhatem', 'Chelghoum Laïd', 'Chigara', 'Derrahi Bousselah', 'El Mechira', 'Elayadi Barbes', 'Ferdjioua', 'Grarem Gouga', 'Hamala', 'Khemis', 'Mechta Ouled Ourabah', 'Minar Zarza', 'Oued Athmania', 'Oued Endja', 'Oued Seguen', 'Ouled Khalouf', 'Rouached', 'Sidi Khelifa', 'Sidi Merouane', 'Tadjenanet', 'Tassadane Haddada', 'Teleghma', 'Terrai Bainen', 'Tessala Lemtaï', 'Tiberguent', 'Yahia Beni Guecha', 'Zeghaia']
    },
    {
      name: 'Aïn Defla',
      localGovernments: ['Aïn Defla', 'Aïn Benian', 'Aïn Bouyahia', 'Aïn Lechiakh', 'Aïn Soltane', 'Aïn Torki', 'Arib', 'Bathia', 'Belaas', 'Ben Allal', 'Bir Ouled Khelifa', 'Bordj Emir Khaled', 'Boumedfaa', 'Bourached', 'Djelida', 'Djemaa Ouled Cheikh', 'El Abadia', 'El Amra', 'El Attaf', 'El Hassania', 'El Maine', 'Hammam Righa', 'Hoceinia', 'Khemis Miliana', 'Mekhatria', 'Miliana', 'Oued Chorfa', 'Oued Djemaa', 'Rouina', 'Sidi Lakhdar', 'Tacheta Zegagha', 'Tarik Ibn Ziad', 'Tiberkanine', 'Zeddine']
    },
    {
      name: 'Naâma',
      localGovernments: ['Naâma', 'Aïn Ben Khelil', 'Aïn Sefra', 'Asla', 'Djeniene Bourezg', 'El Biod', 'Kasdir', 'Mecheria', 'Moghrar', 'Sfissifa', 'Tiout']
    },
    {
      name: 'Aïn Témouchent',
      localGovernments: ['Aïn Témouchent', 'Aghlal', 'Aïn El Arbaa', 'Aïn Kihal', 'Aïn Tolba', 'Aoubellil', 'Beni Saf', 'Bouzedjar', 'Chaabet El Ham', 'Chentouf', 'El Amria', 'El Emir Abdelkader', 'El Malah', 'El Messaid', 'Hammam Bou Hadjar', 'Hassasna', 'Hassi El Ghella', 'Oued Berkeche', 'Oued Sabah', 'Ouled Boudjemaa', 'Ouled Kihal', 'Sidi Ben Adda', 'Sidi Boumedienne', 'Sidi Ouriache', 'Sidi Safi', 'Tamzoura', 'Terga']
    },
    {
      name: 'Ghardaïa',
      localGovernments: ['Ghardaïa', 'Berriane', 'Bounoura', 'Dhayet Bendhahoua', 'El Atteuf', 'El Guerrara', 'El Menia', 'Metlili', 'Sebseb', 'Zelfana']
    },
    {
      name: 'Relizane',
      localGovernments: ['Relizane', 'Aïn Rahma', 'Aïn Tarek', 'Ammi Moussa', 'Belassel Bouzegza', 'Bendaoud', 'Beni Dergoun', 'Beni Zentis', 'Dar Ben Abdellah', 'Djidioua', 'El Guettar', 'El Hamadna', 'El Hassi', 'El Matmar', 'El Ouldja', 'Had Echkalla', 'Hamri', 'Kalaa', 'Lahlef', 'Mazouna', 'Mendes', 'Merdja Sidi Abed', 'Ouarizane', 'Oued El Djemaa', 'Oued Essalem', 'Ouled Aiche', 'Ouled Sidi Mihoub', 'Ramka', 'Relizane', 'Sidi Khettab', 'Sidi Lazreg', 'Sidi M\'Hamed Ben Ali', 'Sidi Saada', 'Souk El Had', 'Yellel', 'Zemmora']
    }
  ]
},
  {
    name: 'Andorra',
    code: 'AD',
    states: [
      { name: 'Andorra la Vella', localGovernments: ['Andorra la Vella Parish'] },
      { name: 'Escaldes-Engordany', localGovernments: ['Escaldes-Engordany Parish'] }
    ]
  },
  {
  name: 'Angola',
  code: 'AO',
  states: [
    {
      name: 'Bengo',
      localGovernments: [
        'Ambriz', 'Bula Atumba', 'Dande', 'Dembos', 'Nambuangongo', 'Pango Aluquém'
      ]
    },
    {
      name: 'Benguela',
      localGovernments: [
        'Baía Farta', 'Balombo', 'Benguela', 'Bocoio', 'Caimbambo', 'Catumbela', 'Chongorói', 'Cubal', 'Ganda', 'Lobito'
      ]
    },
    {
      name: 'Bié',
      localGovernments: [
        'Andulo', 'Camacupa', 'Catabola', 'Chinguar', 'Chitembo', 'Cuemba', 'Cunhinga', 'Cuíto', 'Nharea'
      ]
    },
    {
      name: 'Cabinda',
      localGovernments: [
        'Belize', 'Buco-Zau', 'Cabinda', 'Cacongo'
      ]
    },
    {
      name: 'Cuando Cubango',
      localGovernments: [
        'Calai', 'Cuangar', 'Cuchi', 'Cuito Cuanavale', 'Dirico', 'Mavinga', 'Menongue', 'Nancova', 'Rivungo'
      ]
    },
    {
      name: 'Cuanza Norte',
      localGovernments: [
        'Ambaca', 'Banga', 'Bolongongo', 'Cambambe', 'Cazengo', 'Golungo Alto', 'Gonguembo', 'Lucala', 'Quiculungo', 'Samba Caju'
      ]
    },
    {
      name: 'Cuanza Sul',
      localGovernments: [
        'Amboim', 'Cassongue', 'Cela', 'Conda', 'Ebo', 'Libolo', 'Mussende', 'Porto Amboim', 'Quibala', 'Quilenda', 'Seles', 'Sumbe'
      ]
    },
    {
      name: 'Cunene',
      localGovernments: [
        'Cahama', 'Cuanhama', 'Curoca', 'Cuvelai', 'Namacunde', 'Ombadja'
      ]
    },
    {
      name: 'Huambo',
      localGovernments: [
        'Bailundo', 'Cachiungo', 'Caála', 'Ecunha', 'Huambo', 'Londuimbali', 'Longonjo', 'Mungo', 'Chicala-Cholohanga', 'Chinjenje', 'Ucuma'
      ]
    },
    {
      name: 'Huíla',
      localGovernments: [
        'Caconda', 'Cacula', 'Caluquembe', 'Chibia', 'Chicomba', 'Chipindo', 'Gambos', 'Humpata', 'Jamba', 'Lubango', 'Matala', 'Quilengues', 'Quipungo'
      ]
    },
    {
      name: 'Luanda',
      localGovernments: [
        'Belas', 'Cacuaco', 'Cazenga', 'Ícolo e Bengo', 'Luanda', 'Quiçama', 'Quilamba Quiaxi', 'Quissama', 'Talatona', 'Viana'
      ]
    },
    {
      name: 'Lunda Norte',
      localGovernments: [
        'Cambulo', 'Capenda Camulemba', 'Caungula', 'Chitato', 'Cuango', 'Cuílo', 'Lóvua', 'Lubalo', 'Lucapa', 'Xá-Muteba'
      ]
    },
    {
      name: 'Lunda Sul',
      localGovernments: [
        'Cacolo', 'Dala', 'Muconda', 'Saurimo'
      ]
    },
    {
      name: 'Malanje',
      localGovernments: [
        'Cacuso', 'Calandula', 'Cambundi-Catembo', 'Cangandala', 'Caombo', 'Cuaba Nzogo', 'Cunda-Dia-Baze', 'Luquembo', 'Malanje', 'Marimba', 'Massango', 'Mucari', 'Quela', 'Quirima'
      ]
    },
    {
      name: 'Moxico',
      localGovernments: [
        'Alto Zambeze', 'Bundas', 'Camanongue', 'Léua', 'Luau', 'Luacano', 'Luchazes', 'Cameia', 'Moxico'
      ]
    },
    {
      name: 'Namibe',
      localGovernments: [
        'Bibala', 'Camucuio', 'Moçâmedes', 'Tômbua', 'Virei'
      ]
    },
    {
      name: 'Uíge',
      localGovernments: [
        'Alto Cauale', 'Ambuíla', 'Bembe', 'Buengas', 'Bungo', 'Damba', 'Milunga', 'Mucaba', 'Negage', 'Puri', 'Quimbele', 'Quitexe', 'Sanza Pombo', 'Songo', 'Uíge', 'Zombo'
      ]
    },
    {
      name: 'Zaire',
      localGovernments: [
        'Cuimba', 'Mabanza Congo', 'Nóqui', 'Nezeto', 'Soio', 'Tomboco'
      ]
    }
  ]
},
  {
    name: 'Antigua and Barbuda',
    code: 'AG',
    states: [
      { name: 'Saint John', localGovernments: ['St. John\'s'] },
      { name: 'Barbuda', localGovernments: ['Codrington'] }
    ]
  },
  {
    name: 'Argentina',
    code: 'AR',
    states: [
      { name: 'Buenos Aires', localGovernments: ['Buenos Aires City', 'La Plata', 'Mar del Plata'] },
      { name: 'Córdoba', localGovernments: ['Córdoba City', 'Villa María', 'Río Cuarto'] },
      { name: 'Santa Fe', localGovernments: ['Rosario', 'Santa Fe City', 'Rafaela'] }
    ]
  },
  {
    name: 'Armenia',
    code: 'AM',
    states: [
      { name: 'Yerevan', localGovernments: ['Yerevan City', 'Kentron', 'Arabkir'] },
      { name: 'Kotayk', localGovernments: ['Abovyan', 'Hrazdan', 'Charentsavan'] }
    ]
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      { name: 'New South Wales', localGovernments: ['Sydney', 'Newcastle', 'Wollongong'] },
      { name: 'Victoria', localGovernments: ['Melbourne', 'Geelong', 'Ballarat'] },
      { name: 'Queensland', localGovernments: ['Brisbane', 'Gold Coast', 'Sunshine Coast'] },
      { name: 'Western Australia', localGovernments: ['Perth', 'Fremantle', 'Mandurah'] },
      { name: 'South Australia', localGovernments: ['Adelaide', 'Mount Gambier', 'Whyalla'] },
      { name: 'Tasmania', localGovernments: ['Hobart', 'Launceston', 'Devonport'] }
    ]
  },
  {
    name: 'Austria',
    code: 'AT',
    states: [
      { name: 'Vienna', localGovernments: ['Innere Stadt', 'Leopoldstadt', 'Landstraße'] },
      { name: 'Tyrol', localGovernments: ['Innsbruck', 'Kufstein', 'Schwaz'] }
    ]
  },
  {
    name: 'Azerbaijan',
    code: 'AZ',
    states: [
      { name: 'Baku', localGovernments: ['Baku City', 'Sumqayit', 'Khirdalan'] },
      { name: 'Ganja-Gazakh', localGovernments: ['Ganja', 'Gazakh', 'Tovuz'] }
    ]
  },
  {
    name: 'Bahamas',
    code: 'BS',
    states: [
      { name: 'New Providence', localGovernments: ['Nassau'] },
      { name: 'Grand Bahama', localGovernments: ['Freeport', 'Lucaya'] }
    ]
  },
  {
    name: 'Bahrain',
    code: 'BH',
    states: [
      { name: 'Capital', localGovernments: ['Manama', 'Isa Town', 'Riffa'] },
      { name: 'Muharraq', localGovernments: ['Muharraq City', 'Arad', 'Hidd'] }
    ]
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    states: [
      { name: 'Dhaka', localGovernments: ['Dhaka City', 'Gazipur', 'Narayanganj'] },
      { name: 'Chittagong', localGovernments: ['Chittagong City', 'Cox\'s Bazar', 'Comilla'] }
    ]
  },
  {
    name: 'Barbados',
    code: 'BB',
    states: [
      { name: 'Saint Michael', localGovernments: ['Bridgetown'] },
      { name: 'Christ Church', localGovernments: ['Oistins', 'Silver Sands'] }
    ]
  },
  {
    name: 'Belarus',
    code: 'BY',
    states: [
      { name: 'Minsk', localGovernments: ['Minsk City', 'Zavodskoi', 'Leninsky'] },
      { name: 'Brest', localGovernments: ['Brest City', 'Baranovichi', 'Pinsk'] }
    ]
  },
  {
    name: 'Belgium',
    code: 'BE',
    states: [
      { name: 'Brussels', localGovernments: ['Brussels City', 'Schaerbeek', 'Anderlecht'] },
      { name: 'Antwerp', localGovernments: ['Antwerp City', 'Mechelen', 'Turnhout'] }
    ]
  },
  {
    name: 'Belize',
    code: 'BZ',
    states: [
      { name: 'Belize', localGovernments: ['Belize City', 'Ladyville', 'San Pedro'] },
      { name: 'Cayo', localGovernments: ['Belmopan', 'San Ignacio', 'Benque Viejo'] }
    ]
  },
 {
  name: 'Benin',
  code: 'BJ',
  states: [
    {
      name: 'Alibori',
      localGovernments: [
        'Banikoara', 'Gogounou', 'Kandi', 'Karimama', 'Malanville', 'Segbana'
      ]
    },
    {
      name: 'Atacora',
      localGovernments: [
        'Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 'Matéri', 'Natitingou', 'Pehonko', 'Tanguiéta', 'Toucountouna'
      ]
    },
    {
      name: 'Atlantique',
      localGovernments: [
        'Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè'
      ]
    },
    {
      name: 'Borgou',
      localGovernments: [
        'Bembèrèkè', 'Kalalé', 'N\'Dali', 'Nikki', 'Parakou', 'Pèrèrè', 'Sinendé', 'Tchaourou'
      ]
    },
    {
      name: 'Collines',
      localGovernments: [
        'Bantè', 'Dassa-Zoumè', 'Glazoué', 'Ouèssè', 'Savalou', 'Savé'
      ]
    },
    {
      name: 'Donga',
      localGovernments: [
        'Bassila', 'Copargo', 'Djougou', 'Ouaké'
      ]
    },
    {
      name: 'Kouffo',
      localGovernments: [
        'Aplahoué', 'Djakotomey', 'Dogbo-Tota', 'Klouékanmè', 'Lalo', 'Toviklin'
      ]
    },
    {
      name: 'Littoral',
      localGovernments: [
        'Cotonou'
      ]
    },
    {
      name: 'Mono',
      localGovernments: [
        'Athieme', 'Bopa', 'Comè', 'Grand-Popo', 'Houéyogbé', 'Lokossa'
      ]
    },
    {
      name: 'Ouémé',
      localGovernments: [
        'Adjarra', 'Adjohoun', 'Aguégués', 'Akpro-Missérété', 'Avrankou', 'Bonou', 'Dangbo', 'Porto-Novo', 'Sèmè-Kpodji'
      ]
    },
    {
      name: 'Plateau',
      localGovernments: [
        'Ifangni', 'Adja-Ouèrè', 'Kétou', 'Pobè', 'Sakété'
      ]
    },
    {
      name: 'Zou',
      localGovernments: [
        'Abomey', 'Agbangnizoun', 'Bohicon', 'Covè', 'Djidja', 'Ouinhi', 'Za-Kpota', 'Zangnanado', 'Zogbodomey'
      ]
    }
  ]
},
  {
    name: 'Bhutan',
    code: 'BT',
    states: [
      { name: 'Thimphu', localGovernments: ['Thimphu City'] },
      { name: 'Paro', localGovernments: ['Paro Town'] }
    ]
  },
  {
    name: 'Bolivia',
    code: 'BO',
    states: [
      { name: 'La Paz', localGovernments: ['La Paz City', 'El Alto', 'Viacha'] },
      { name: 'Santa Cruz', localGovernments: ['Santa Cruz de la Sierra', 'Montero', 'Warnes'] }
    ]
  },
  {
    name: 'Bosnia and Herzegovina',
    code: 'BA',
    states: [
      { name: 'Federation of Bosnia and Herzegovina', localGovernments: ['Sarajevo', 'Tuzla', 'Zenica'] },
      { name: 'Republika Srpska', localGovernments: ['Banja Luka', 'Bijeljina', 'Prijedor'] }
    ]
  },
  {
  name: 'Botswana',
  code: 'BW',
  states: [
    {
      name: 'Central',
      localGovernments: [
        'Bobonong', 'Boteti', 'Mahalapye', 'Orapa', 'Serowe/Palapye', 'Tutume'
      ]
    },
    {
      name: 'Ghanzi',
      localGovernments: [
        'Ghanzi', 'Charles Hill', 'Dekar', 'Bere'
      ]
    },
    {
      name: 'Kgalagadi',
      localGovernments: [
        'Kgalagadi North', 'Kgalagadi South'
      ]
    },
    {
      name: 'Kgatleng',
      localGovernments: [
        'Mochudi', 'Mmankgodi', 'Oodi', 'Kopong', 'Mmathubudukwane'
      ]
    },
    {
      name: 'Kweneng',
      localGovernments: [
        'Molepolole', 'Letlhakeng', 'Mogoditshane', 'Thamaga', 'Gabane', 'Kweneng East', 'Lentsweletau'
      ]
    },
    {
      name: 'Ngamiland',
      localGovernments: [
        'Ngamiland East', 'Ngamiland West', 'Delta'
      ]
    },
    {
      name: 'North-East',
      localGovernments: [
        'Francistown', 'Masunga', 'Tati', 'Tutume'
      ]
    },
    {
      name: 'North-West',
      localGovernments: [
        'Maun', 'Ngamiland', 'Chobe', 'Okavango'
      ]
    },
    {
      name: 'South-East',
      localGovernments: [
        'Ramotswa', 'Gabane', 'Mogoditshane', 'Otse', 'Taung'
      ]
    },
    {
      name: 'Southern',
      localGovernments: [
        'Kanye', 'Moshupa', 'Goodhope', 'Jwaneng', 'Lobatse', 'Barolong'
      ]
    },
    {
      name: 'Chobe',
      localGovernments: [
        'Kasane', 'Pandamatenga', 'Kazungula'
      ]
    },
    {
      name: 'Gaborone',
      localGovernments: [
        'Gaborone City', 'Tlokweng', 'Mogoditshane'
      ]
    },
    {
      name: 'Jwaneng',
      localGovernments: [
        'Jwaneng Town'
      ]
    },
    {
      name: 'Lobatse',
      localGovernments: [
        'Lobatse Town'
      ]
    },
    {
      name: 'Selibe Phikwe',
      localGovernments: [
        'Selebi-Phikwe Town'
      ]
    },
    {
      name: 'Sowa Town',
      localGovernments: [
        'Sowa Township'
      ]
    }
  ]
},
  {
    name: 'Brazil',
    code: 'BR',
    states: [
      { name: 'São Paulo', localGovernments: ['São Paulo City', 'Guarulhos', 'Campinas'] },
      { name: 'Rio de Janeiro', localGovernments: ['Rio de Janeiro City', 'Niterói', 'Duque de Caxias'] },
      { name: 'Minas Gerais', localGovernments: ['Belo Horizonte', 'Uberlândia', 'Contagem'] }
    ]
  },
  {
    name: 'Brunei',
    code: 'BN',
    states: [
      { name: 'Brunei-Muara', localGovernments: ['Bandar Seri Begawan', 'Gadong', 'Berakas'] },
      { name: 'Belait', localGovernments: ['Kuala Belait', 'Seria'] }
    ]
  },
  {
    name: 'Bulgaria',
    code: 'BG',
    states: [
      { name: 'Sofia City', localGovernments: ['Sofia Municipality', 'Mladost', 'Lyulin'] },
      { name: 'Plovdiv', localGovernments: ['Plovdiv Municipality', 'Maritsa', 'Rodopi'] }
    ]
  },
 {
  name: 'Burkina Faso',
  code: 'BF',
  states: [
    {
      name: 'Boucle du Mouhoun',
      localGovernments: [
        'Balé', 'Banwa', 'Kossi', 'Mouhoun', 'Nayala', 'Sourou'
      ]
    },
    {
      name: 'Cascades',
      localGovernments: [
        'Comoé', 'Léraba'
      ]
    },
    {
      name: 'Centre',
      localGovernments: [
        'Kadiogo'
      ]
    },
    {
      name: 'Centre-Est',
      localGovernments: [
        'Boulgou', 'Koulpélogo', 'Kouritenga'
      ]
    },
    {
      name: 'Centre-Nord',
      localGovernments: [
        'Bam', 'Namentenga', 'Sanmatenga'
      ]
    },
    {
      name: 'Centre-Ouest',
      localGovernments: [
        'Boulkiemdé', 'Sanguié', 'Sissili', 'Ziro'
      ]
    },
    {
      name: 'Centre-Sud',
      localGovernments: [
        'Bazèga', 'Nahouri', 'Zoundwéogo'
      ]
    },
    {
      name: 'Est',
      localGovernments: [
        'Gnagna', 'Gourma', 'Komondjari', 'Kompienga', 'Tapoa'
      ]
    },
    {
      name: 'Hauts-Bassins',
      localGovernments: [
        'Houet', 'Kénédougou', 'Tuy'
      ]
    },
    {
      name: 'Nord',
      localGovernments: [
        'Loroum', 'Passoré', 'Yatenga', 'Zondoma'
      ]
    },
    {
      name: 'Plateau-Central',
      localGovernments: [
        'Ganzourgou', 'Kourwéogo', 'Oubritenga'
      ]
    },
    {
      name: 'Sahel',
      localGovernments: [
        'Oudalan', 'Séno', 'Soum', 'Yagha'
      ]
    },
    {
      name: 'Sud-Ouest',
      localGovernments: [
        'Bougouriba', 'Ioba', 'Noumbiel', 'Poni'
      ]
    }
  ]
},
 {
  name: 'Burundi',
  code: 'BI',
  states: [
    {
      name: 'Bubanza',
      localGovernments: [
        'Bubanza', 'Gihanga', 'Musigati', 'Mpanda', 'Rugazi'
      ]
    },
    {
      name: 'Bujumbura Mairie',
      localGovernments: [
        'Bujumbura', 'Mukaza', 'Muha', 'North Bujumbura'
      ]
    },
    {
      name: 'Bujumbura Rural',
      localGovernments: [
        'Isale', 'Kabezi', 'Mubimbi', 'Mugongomanga', 'Mukike', 'Mutambu', 'Mutimbuzi', 'Nyabiraba'
      ]
    },
    {
      name: 'Bururi',
      localGovernments: [
        'Bururi', 'Burambi', 'Buyengero', 'Matana', 'Mugamba', 'Rumonge', 'Songa', 'Vyanda'
      ]
    },
    {
      name: 'Cankuzo',
      localGovernments: [
        'Cankuzo', 'Cendajuru', 'Gisagara', 'Kigamba', 'Mishiha'
      ]
    },
    {
      name: 'Cibitoke',
      localGovernments: [
        'Cibitoke', 'Buganda', 'Bukinanyana', 'Mabayi', 'Mugina', 'Murwi'
      ]
    },
    {
      name: 'Gitega',
      localGovernments: [
        'Gitega', 'Bugendana', 'Bukirasazi', 'Buraza', 'Giheta', 'Gishubi', 'Kanyinya', 'Makebuko', 'Mutaho', 'Nyarusange', 'Ryansoro'
      ]
    },
    {
      name: 'Karuzi',
      localGovernments: [
        'Karuzi', 'Bugenyuzi', 'Buhiga', 'Gihogazi', 'Gitaramuka', 'Mutumba', 'Nyabikere', 'Shombo'
      ]
    },
    {
      name: 'Kayanza',
      localGovernments: [
        'Kayanza', 'Butaganzwa', 'Gahombo', 'Gatara', 'Kabarore', 'Matongo', 'Muhanga', 'Muruta', 'Rango'
      ]
    },
    {
      name: 'Kirundo',
      localGovernments: [
        'Kirundo', 'Bugabira', 'Bwambarangwe', 'Gitobe', 'Ntega', 'Vumbi'
      ]
    },
    {
      name: 'Makamba',
      localGovernments: [
        'Makamba', 'Kayogoro', 'Kibago', 'Mabanda', 'Nyanza-Lac', 'Vugizo'
      ]
    },
    {
      name: 'Muramvya',
      localGovernments: [
        'Muramvya', 'Bukeye', 'Kiganda', 'Mbuye', 'Rutegama'
      ]
    },
    {
      name: 'Muyinga',
      localGovernments: [
        'Muyinga', 'Butihinda', 'Gashoho', 'Gasorwe', 'Giteranyi', 'Mwakiro'
      ]
    },
    {
      name: 'Mwaro',
      localGovernments: [
        'Mwaro', 'Bisoro', 'Gisozi', 'Kayokwe', 'Ndava', 'Nyabihanga', 'Rusaka'
      ]
    },
    {
      name: 'Ngozi',
      localGovernments: [
        'Ngozi', 'Buhinyuza', 'Busiga', 'Gashikanwa', 'Kiremba', 'Marangara', 'Mwumba', 'Nyamurenza', 'Ruhororo', 'Tangara'
      ]
    },
    {
      name: 'Rumonge',
      localGovernments: [
        'Rumonge', 'Burambi', 'Buhiga', 'Buyengero', 'Mugamba'
      ]
    },
    {
      name: 'Rutana',
      localGovernments: [
        'Rutana', 'Bukemba', 'Giharo', 'Gitanga', 'Mpinga-Kayove', 'Musongati'
      ]
    },
    {
      name: 'Ruyigi',
      localGovernments: [
        'Ruyigi', 'Butaganzwa', 'Butezi', 'Bweru', 'Gisuru', 'Kinyinya', 'Nyabitsinda'
      ]
    }
  ]
},
  {
    name: 'Cambodia',
    code: 'KH',
    states: [
      { name: 'Phnom Penh', localGovernments: ['Chamkar Mon', 'Doun Penh', 'Prampir Meakkakra'] },
      { name: 'Siem Reap', localGovernments: ['Siem Reap City', 'Angkor Thom', 'Puok'] }
    ]
  },
  {
  name: 'Cameroon',
  code: 'CM',
  states: [
    {
      name: 'Adamawa',
      localGovernments: [
        'Djérem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina'
      ]
    },
    {
      name: 'Centre',
      localGovernments: [
        'Haute-Sanaga', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Mfoundi', 'Nyong-et-Kéllé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o'
      ]
    },
    {
      name: 'East',
      localGovernments: [
        'Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem'
      ]
    },
    {
      name: 'Far North',
      localGovernments: [
        'Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'
      ]
    },
    {
      name: 'Littoral',
      localGovernments: [
        'Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri'
      ]
    },
    {
      name: 'North',
      localGovernments: [
        'Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'
      ]
    },
    {
      name: 'Northwest',
      localGovernments: [
        'Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'
      ]
    },
    {
      name: 'West',
      localGovernments: [
        'Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Ndé', 'Noun'
      ]
    },
    {
      name: 'South',
      localGovernments: [
        'Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'
      ]
    },
    {
      name: 'Southwest',
      localGovernments: [
        'Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'
      ]
    }
  ]
},
  {
    name: 'Canada',
    code: 'CA',
    states: [
      { name: 'Ontario', localGovernments: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton'] },
      { name: 'Quebec', localGovernments: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'] },
      { name: 'British Columbia', localGovernments: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond'] },
      { name: 'Alberta', localGovernments: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'] },
      { name: 'Manitoba', localGovernments: ['Winnipeg', 'Brandon', 'Steinbach'] },
      { name: 'Saskatchewan', localGovernments: ['Saskatoon', 'Regina', 'Prince Albert'] },
      { name: 'Nova Scotia', localGovernments: ['Halifax', 'Cape Breton', 'Truro'] },
      { name: 'New Brunswick', localGovernments: ['Moncton', 'Saint John', 'Fredericton'] },
      { name: 'Newfoundland and Labrador', localGovernments: ['St. John\'s', 'Mount Pearl', 'Corner Brook'] },
      { name: 'Prince Edward Island', localGovernments: ['Charlottetown', 'Summerside', 'Stratford'] }
    ]
  },
  {
  name: 'Cape Verde',
  code: 'CV',
  states: [
    {
      name: 'Santiago',
      localGovernments: [
        'Praia', 'São Domingos', 'Santa Catarina', 'São Salvador do Mundo', 'Santa Cruz', 
        'São Lourenço dos Órgãos', 'Ribeira Grande de Santiago', 'São Miguel', 'Tarrafal'
      ]
    },
    {
      name: 'São Vicente',
      localGovernments: [
        'Mindelo', 'São Vicente'
      ]
    },
    {
      name: 'Sal',
      localGovernments: [
        'Sal'
      ]
    },
    {
      name: 'Boa Vista',
      localGovernments: [
        'Boa Vista'
      ]
    },
    {
      name: 'Maio',
      localGovernments: [
        'Maio'
      ]
    },
    {
      name: 'Santo Antão',
      localGovernments: [
        'Ribeira Grande', 'Paul', 'Porto Novo'
      ]
    },
    {
      name: 'Fogo',
      localGovernments: [
        'São Filipe', 'Santa Catarina do Fogo', 'Mosteiros'
      ]
    },
    {
      name: 'Brava',
      localGovernments: [
        'Brava'
      ]
    },
    {
      name: 'São Nicolau',
      localGovernments: [
        'Ribeira Brava', 'Tarrafal de São Nicolau'
      ]
    }
  ]
},
 {
  name: 'Chad',
  code: 'TD',
  states: [
    {
      name: 'Bahr el Gazel',
      localGovernments: [
        'Moussoro', 'Bahr el Gazel Nord', 'Bahr el Gazel Sud'
      ]
    },
    {
      name: 'Batha',
      localGovernments: [
        'Ati', 'Batha Est', 'Batha Ouest', 'Fitri'
      ]
    },
    {
      name: 'Borkou',
      localGovernments: [
        'Faya-Largeau', 'Borkou Yala', 'Borkou Nord'
      ]
    },
    {
      name: 'Chari-Baguirmi',
      localGovernments: [
        'Massénia', 'Baguirmi', 'Chari', 'Loug Chari'
      ]
    },
    {
      name: 'Ennedi-Est',
      localGovernments: [
        'Am-Djarass', 'Wadi Hawar', 'Ennedi'
      ]
    },
    {
      name: 'Ennedi-Ouest',
      localGovernments: [
        'Fada', 'Mourtcha', 'Ennedi Ouest'
      ]
    },
    {
      name: 'Guéra',
      localGovernments: [
        'Mongo', 'Barh Signaka', 'Guéra', 'Mangalmé'
      ]
    },
    {
      name: 'Hadjer-Lamis',
      localGovernments: [
        'Massakory', 'Dababa', 'Dagana', 'Haraze Al Biar'
      ]
    },
    {
      name: 'Kanem',
      localGovernments: [
        'Mao', 'Kanem', 'Nord Kanem', 'Wadi Bissam'
      ]
    },
    {
      name: 'Lac',
      localGovernments: [
        'Bol', 'Mamdi', 'Wayi'
      ]
    },
    {
      name: 'Logone Occidental',
      localGovernments: [
        'Moundou', 'Dodjé', 'Guéni', 'Lac Wey', 'Ngourkosso'
      ]
    },
    {
      name: 'Logone Oriental',
      localGovernments: [
        'Doba', 'La Nya Pendé', 'La Pendé', 'Monts de Lam', 'Kouh-Est', 'Kouh-Ouest'
      ]
    },
    {
      name: 'Mandoul',
      localGovernments: [
        'Koumra', 'Barh Sara', 'Mandoul Occidental', 'Mandoul Oriental'
      ]
    },
    {
      name: 'Mayo-Kebbi Est',
      localGovernments: [
        'Bongor', 'Kabbia', 'Mont d\'Illi', 'Mayo-Boneye'
      ]
    },
    {
      name: 'Mayo-Kebbi Ouest',
      localGovernments: [
        'Pala', 'Lac Léré', 'Mayo-Dallah'
      ]
    },
    {
      name: 'Moyen-Chari',
      localGovernments: [
        'Sarh', 'Barh Kôh', 'Grande Sido', 'Lac Iro'
      ]
    },
    {
      name: 'N\'Djamena',
      localGovernments: [
        'N\'Djamena 1er Arrondissement', 'N\'Djamena 2e Arrondissement', 'N\'Djamena 3e Arrondissement', 'N\'Djamena 4e Arrondissement', 'N\'Djamena 5e Arrondissement', 'N\'Djamena 6e Arrondissement', 'N\'Djamena 7e Arrondissement', 'N\'Djamena 8e Arrondissement', 'N\'Djamena 9e Arrondissement', 'N\'Djamena 10e Arrondissement'
      ]
    },
    {
      name: 'Ouaddaï',
      localGovernments: [
        'Abéché', 'Abdi', 'Assoungha', 'Ouara'
      ]
    },
    {
      name: 'Salamat',
      localGovernments: [
        'Am Timan', 'Aboudeïa', 'Barh Azoum', 'Haraze-Mangueigne'
      ]
    },
    {
      name: 'Sila',
      localGovernments: [
        'Goz Beïda', 'Djourf Al Ahmar', 'Kimiti'
      ]
    },
    {
      name: 'Tandjilé',
      localGovernments: [
        'Laï', 'Tandjilé Est', 'Tandjilé Ouest'
      ]
    },
    {
      name: 'Tibesti',
      localGovernments: [
        'Bardai', 'Tibesti Est', 'Tibesti Ouest'
      ]
    },
    {
      name: 'Wadi Fira',
      localGovernments: [
        'Biltine', 'Dar Tama', 'Kobé', 'Iriba'
      ]
    }
  ]
},
  {
    name: 'Chile',
    code: 'CL',
    states: [
      { name: 'Santiago Metropolitan', localGovernments: ['Santiago', 'Puente Alto', 'Maipú'] },
      { name: 'Valparaíso', localGovernments: ['Valparaíso', 'Viña del Mar', 'Quilpué'] }
    ]
  },
  {
    name: 'China',
    code: 'CN',
    states: [
      { name: 'Beijing', localGovernments: ['Dongcheng', 'Xicheng', 'Chaoyang', 'Haidian'] },
      { name: 'Shanghai', localGovernments: ['Pudong', 'Huangpu', 'Xuhui', 'Changning'] },
      { name: 'Guangdong', localGovernments: ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan'] },
      { name: 'Zhejiang', localGovernments: ['Hangzhou', 'Ningbo', 'Wenzhou'] }
    ]
  },
  {
    name: 'Colombia',
    code: 'CO',
    states: [
      { name: 'Bogotá', localGovernments: ['Bogotá D.C.', 'Usaquén', 'Chapinero'] },
      { name: 'Antioquia', localGovernments: ['Medellín', 'Bello', 'Itagüí'] }
    ]
  },
  {
    name: 'Comoros',
    code: 'KM',
    states: [
      { name: 'Grande Comore', localGovernments: ['Moroni', 'Mitsamiouli'] },
      { name: 'Anjouan', localGovernments: ['Mutsamudu', 'Domoni'] }
    ]
  },
  {
    name: 'Costa Rica',
    code: 'CR',
    states: [
      { name: 'San José', localGovernments: ['San José City', 'Desamparados', 'Goicoechea'] },
      { name: 'Alajuela', localGovernments: ['Alajuela City', 'San Carlos', 'Grecia'] }
    ]
  },
  {
    name: 'Croatia',
    code: 'HR',
    states: [
      { name: 'City of Zagreb', localGovernments: ['Zagreb', 'Sesvete', 'Novi Zagreb'] },
      { name: 'Split-Dalmatia', localGovernments: ['Split', 'Kaštela', 'Solin'] }
    ]
  },
  {
    name: 'Cuba',
    code: 'CU',
    states: [
      { name: 'Havana', localGovernments: ['Havana City', 'Centro Habana', 'Plaza'] },
      { name: 'Santiago de Cuba', localGovernments: ['Santiago de Cuba City'] }
    ]
  },
  {
    name: 'Cyprus',
    code: 'CY',
    states: [
      { name: 'Nicosia', localGovernments: ['Nicosia Municipality', 'Strovolos', 'Lakatamia'] },
      { name: 'Limassol', localGovernments: ['Limassol Municipality', 'Germasogeia', 'Agios Athanasios'] }
    ]
  },
  {
    name: 'Czech Republic',
    code: 'CZ',
    states: [
      { name: 'Prague', localGovernments: ['Prague 1', 'Prague 2', 'Prague 3'] },
      { name: 'South Moravian', localGovernments: ['Brno', 'Znojmo', 'Hodonín'] }
    ]
  },
  {
    name: 'Denmark',
    code: 'DK',
    states: [
      { name: 'Capital Region', localGovernments: ['Copenhagen', 'Frederiksberg', 'Gentofte'] },
      { name: 'Central Denmark', localGovernments: ['Aarhus', 'Randers', 'Horsens'] }
    ]
  },
  {
  name: 'Djibouti',
  code: 'DJ',
  states: [
    {
      name: 'Ali Sabieh',
      localGovernments: [
        'Ali Sabieh', 'Dewele', 'Guelile', 'As Eyla'
      ]
    },
    {
      name: 'Arta',
      localGovernments: [
        'Arta', 'Dorra', 'Wea'
      ]
    },
    {
      name: 'Dikhil',
      localGovernments: [
        'Dikhil', 'As Eyla', 'Yoboki', 'Gobaad'
      ]
    },
    {
      name: 'Djibouti',
      localGovernments: [
        'Djibouti City', 'Balbala', 'Boulaos', 'Raddad'
      ]
    },
    {
      name: 'Obock',
      localGovernments: [
        'Obock', 'Khôr Angar', 'Moulhoule', 'Dorra'
      ]
    },
    {
      name: 'Tadjourah',
      localGovernments: [
        'Tadjourah', 'Randa', 'Dorra', 'Balho'
      ]
    }
  ]
},
  {
    name: 'Dominica',
    code: 'DM',
    states: [
      { name: 'Saint George', localGovernments: ['Roseau'] },
      { name: 'Saint Andrew', localGovernments: ['Marigot'] }
    ]
  },
  {
    name: 'Dominican Republic',
    code: 'DO',
    states: [
      { name: 'Distrito Nacional', localGovernments: ['Santo Domingo'] },
      { name: 'Santiago', localGovernments: ['Santiago de los Caballeros'] }
    ]
  },
  {
    name: 'Ecuador',
    code: 'EC',
    states: [
      { name: 'Pichincha', localGovernments: ['Quito', 'Cayambe', 'Mejía'] },
      { name: 'Guayas', localGovernments: ['Guayaquil', 'Durán', 'Milagro'] }
    ]
  },
 {
  name: 'Egypt',
  code: 'EG',
  states: [
    {
      name: 'Cairo',
      localGovernments: [
        'Cairo Governorate', 'Heliopolis', 'Nasr City', 'Maadi', 'Zamalek', 'Downtown', 'Garden City', 
        'Shubra', 'Abbassia', 'Ain Shams', 'El Marg', 'El Matareya', 'El Khalifa', 'El Sayeda Zeinab', 
        'El Muski', 'Bab El Sharia', 'Boulak', 'El Darb El Ahmar', 'El Gamaliya', 'El Zeituun', 
        'Manshiyat Naser', 'El Basateen', 'El Tebbin', '15th of May', 'El Salam', 'El Nozha', 'El Sherouk'
      ]
    },
    {
      name: 'Alexandria',
      localGovernments: [
        'Alexandria Governorate', 'Borg El Arab', 'Montaza', 'Amreya', 'El Gomrok', 'El Labban', 
        'El Mansheya', 'El Mina', 'Moharam Bek', 'Karmouz', 'El Attarin', 'Dekheila', 'Sidi Gaber', 
        'Sidi Bishr', 'Shaty', 'Glym', 'Asafra', 'Mandra', 'Agami', 'King Mariout'
      ]
    },
    {
      name: 'Giza',
      localGovernments: [
        'Giza Governorate', '6th of October City', 'Sheikh Zayed City', 'Dokki', 'Agouza', 'El Haram', 
        'El Omraniya', 'El Wahat', 'Boulak El Dakrour', 'El Ayyat', 'El Badrasheen', 'El Saff', 
        'Atfih', 'Al Hawamdiya', 'Imbaba', 'Kerdasa', 'Ossim', 'Warraq'
      ]
    },
    {
      name: 'Qalyubia',
      localGovernments: [
        'Banha', 'Qalyub', 'Shubra El Kheima', 'El Qanater El Khayreya', 'Khanka', 'Kafr Shukr', 
        'Tukh', 'Qaha', 'Shibin El Qanater', 'El Ubour'
      ]
    },
    {
      name: 'Port Said',
      localGovernments: [
        'Port Said Governorate', 'Port Fouad', 'El Arab', 'El Dawahi', 'El Manakh', 'El Manasra', 
        'El Sharq', 'El Zohur'
      ]
    },
    {
      name: 'Suez',
      localGovernments: [
        'Suez Governorate', 'Al Ganayen', 'Al Arbaeen', 'Suez'
      ]
    },
    {
      name: 'Damietta',
      localGovernments: [
        'Damietta', 'Faraskur', 'Kafr Saad', 'Kafr El Battikh', 'Ras El Bar', 'Zarqa'
      ]
    },
    {
      name: 'Dakahlia',
      localGovernments: [
        'Mansoura', 'Talkha', 'Mit Ghamr', 'Aga', 'El Manzala', 'Tami El Amdid', 'El Senbellawein', 
        'Bani Ubaid', 'El Gamaliya', 'Sherbin', 'Dekernes', 'Nabaruh', 'Minet El Nasr'
      ]
    },
    {
      name: 'Sharqia',
      localGovernments: [
        'Zagazig', '10th of Ramadan City', 'Minya El Qamh', 'Belbeis', 'Mashtoul El Souk', 
        'Al Qanayat', 'Abu Hammad', 'Abu Kebir', 'Faqous', 'El Husseiniya', 'El Ibrahimiya', 
        'Diarb Negm', 'Kafr Saqr', 'Hehya', 'Awlad Saqr'
      ]
    },
    {
      name: 'Monufia',
      localGovernments: [
        'Shibin El Kom', 'Menouf', 'Sadat City', 'Ashmoun', 'El Bagour', 'Quesna', 'Berket El Sabea', 
        'Tala', 'El Shohada'
      ]
    },
    {
      name: 'Beheira',
      localGovernments: [
        'Damanhur', 'Kafr El Dawwar', 'Rashid', 'Edku', 'Abu El Matamir', 'Abu Hummus', 'El Delengat', 
        'Mahmoudiyah', 'Rahmaniya', 'Hosh Essa', 'Shubrakhit', 'Wadi El Natrun', 'Badr', 'El Nubariyah'
      ]
    },
    {
      name: 'Gharbia',
      localGovernments: [
        'Tanta', 'El Mahalla El Kubra', 'Kafr El Zayat', 'Basioun', 'Qutur', 'Zefta', 'Samannoud', 
        'Santa', 'El Santa', 'Badaway'
      ]
    },
    {
      name: 'Kafr El Sheikh',
      localGovernments: [
        'Kafr El Sheikh', 'Desouk', 'Fuwwah', 'Metoubes', 'Baltim', 'El Hamool', 'Biyala', 'Qallin', 
        'Sidi Salim', 'Riyadh', 'Sakha', 'Burj El Burj'
      ]
    },
    {
      name: 'Ismailia',
      localGovernments: [
        'Ismailia', 'Fayed', 'El Qantara', 'Tell El Kebir', 'El Qantara Sharq', 'Abu Suwir', 
        'Kasaseen', 'El Nuzha'
      ]
    },
    {
      name: 'Luxor',
      localGovernments: [
        'Luxor', 'Armant', 'El Toud', 'El Bayadiya', 'El Ziniya', 'Esna'
      ]
    },
    {
      name: 'Aswan',
      localGovernments: [
        'Aswan', 'Kom Ombo', 'Daraw', 'Nasr El Nuba', 'Kalabsha', 'Edfu', 'El Radisia', 'El Basilia', 
        'El Sad', 'Abu Simbel'
      ]
    },
    {
      name: 'Minya',
      localGovernments: [
        'Minya', 'Beni Mazar', 'Matay', 'Samalut', 'El Idwa', 'Maghagha', 'Abu Qirqas', 'Deir Mawas', 
        'Mallawi', 'Dirout'
      ]
    },
    {
      name: 'Beni Suef',
      localGovernments: [
        'Beni Suef', 'Al Wasta', 'Nasser', 'Ihnasiya', 'Biba', 'Sumusta', 'New Beni Suef'
      ]
    },
    {
      name: 'Faiyum',
      localGovernments: [
        'Faiyum', 'Ibsheway', 'Itsa', 'New Faiyum', 'Tamiya', 'Sinnuris', 'Yousef El Seddik'
      ]
    },
    {
      name: 'Asyut',
      localGovernments: [
        'Asyut', 'Dairut', 'El Qusiya', 'El Badari', 'Sohag', 'Abnub', 'El Ghanayem', 'Sahel Selim', 
        'Manfalut', 'New Asyut'
      ]
    },
    {
      name: 'Sohag',
      localGovernments: [
        'Sohag', 'Akhmim', 'El Balyana', 'El Maragha', 'El Monshah', 'Gerga', 'Juhayna', 'Saqultah', 
        'Tama', 'Tahta', 'Dar El Salam', 'Girga'
      ]
    },
    {
      name: 'Qena',
      localGovernments: [
        'Qena', 'Abu Tesht', 'El Waqf', 'Deshna', 'Farshout', 'Naqada', 'Qift', 'Qus', 'New Qena', 
        'Nag Hammadi'
      ]
    },
    {
      name: 'Red Sea',
      localGovernments: [
        'Hurghada', 'Ras Ghareb', 'Safaga', 'El Qoseir', 'Marsa Alam', 'Shalatin', 'Halaib'
      ]
    },
    {
      name: 'New Valley',
      localGovernments: [
        'Kharga', 'Dakhla', 'Farafra', 'Baris', 'Mut', 'Paris Oasis'
      ]
    },
    {
      name: 'Matrouh',
      localGovernments: [
        'Marsa Matrouh', 'El Dabaa', 'El Negaila', 'Sidi Barrani', 'Sallum', 'Siwa Oasis'
      ]
    },
    {
      name: 'North Sinai',
      localGovernments: [
        'Arish', 'Sheikh Zuweid', 'Rafah', 'Bir El Abd', 'El Hassana', 'Nakhl'
      ]
    },
    {
      name: 'South Sinai',
      localGovernments: [
        'El Tor', 'Sharm El Sheikh', 'Dahab', 'Nuweiba', 'Ras Sidr', 'Saint Catherine', 'Abu Redis', 
        'Abu Zenima'
      ]
    }
  ]
},
  {
    name: 'El Salvador',
    code: 'SV',
    states: [
      { name: 'San Salvador', localGovernments: ['San Salvador City', 'Soyapango', 'Santa Tecla'] },
      { name: 'La Libertad', localGovernments: ['Santa Tecla', 'Antiguo Cuscatlán'] }
    ]
  },
  {
  name: 'Equatorial Guinea',
  code: 'GQ',
  states: [
    {
      name: 'Annobón',
      localGovernments: [
        'San Antonio de Palé', 'Mabana'
      ]
    },
    {
      name: 'Bioko Norte',
      localGovernments: [
        'Malabo', 'Rebola', 'Baney', 'Santiago de Baney'
      ]
    },
    {
      name: 'Bioko Sur',
      localGovernments: [
        'Luba', 'Riaba', 'Batete', 'Moka'
      ]
    },
    {
      name: 'Centro Sur',
      localGovernments: [
        'Evinayong', 'Niefang', 'Akurenam', 'Bicurga', 'Nkimi'
      ]
    },
    {
      name: 'Kié-Ntem',
      localGovernments: [
        'Ebebiyín', 'Nsok', 'Mikomeseng', 'Ncue', 'Bidjabidjan'
      ]
    },
    {
      name: 'Litoral',
      localGovernments: [
        'Bata', 'Mbini', 'Cogo', 'Machinda', 'Acurenam', 'Bitica', 'Kogo'
      ]
    },
    {
      name: 'Wele-Nzas',
      localGovernments: [
        'Mongomo', 'Añisoc', 'Aconibe', 'Ayene', 'Nsork', 'Mengomeyén'
      ]
    },
    {
      name: 'Djibloho',
      localGovernments: [
        'Ciudad de la Paz', 'Mongomo'
      ]
    }
  ]
},
  {
  name: 'Eritrea',
  code: 'ER',
  states: [
    {
      name: 'Maekel',
      localGovernments: [
        'Asmara', 'Adi Keyh', 'Berikh', 'Ghala Nefhi', 'North Eastern', 'Serejaka', 'South Eastern'
      ]
    },
    {
      name: 'Debub',
      localGovernments: [
        'Mendefera', 'Senafe', 'Adi Quala', 'Areza', 'Dekemhare', 'Kudo Beur', 'May-Mine', 'Tserona', 'Emni Haili'
      ]
    },
    {
      name: 'Gash-Barka',
      localGovernments: [
        'Barentu', 'Agordat', 'Dghe', 'Forto', 'Gogne', 'Haykota', 'Logo Anseba', 'Mensura', 'Mogolo', 'Molki', 'Omhajer', 'Shambuko', 'Tesseney', 'Upper Gash'
      ]
    },
    {
      name: 'Anseba',
      localGovernments: [
        'Keren', 'Adi Tekelezan', 'Asmat', 'Elabered', 'Geleb', 'Hagaz', 'Halhal', 'Habero', 'Kerkebet', 'Sela'
      ]
    },
    {
      name: 'Northern Red Sea',
      localGovernments: [
        'Massawa', 'Afabet', 'Dahlak', 'Ghelalo', 'Foro', 'Ghinda', 'Karura', 'Nakfa', 'Sheeb', 'North Eastern'
      ]
    },
    {
      name: 'Southern Red Sea',
      localGovernments: [
        'Assab', 'Areeta', 'Central Denkalya', 'Southern Denkalya', 'Thio'
      ]
    }
  ]
},
  {
    name: 'Estonia',
    code: 'EE',
    states: [
      { name: 'Harju', localGovernments: ['Tallinn', 'Maardu', 'Keila'] },
      { name: 'Tartu', localGovernments: ['Tartu City', 'Elva', 'Kallaste'] }
    ]
  },
  {
  name: 'Ethiopia',
  code: 'ET',
  states: [
    {
      name: 'Addis Ababa',
      localGovernments: [
        'Addis Ababa City', 'Bole', 'Kirkos', 'Arada', 'Lideta', 'Yeka', 'Nifas Silk-Lafto', 
        'Kolfe Keranio', 'Gulele', 'Akaki Kaliti', 'Addis Ketema'
      ]
    },
    {
      name: 'Afar',
      localGovernments: [
        'Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'
      ]
    },
    {
      name: 'Amhara',
      localGovernments: [
        'Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Debre Birhan', 'Kombolcha', 
        'Woldia', 'Debre Tabor', 'Kobo', 'Kemise', 'Finote Selam', 'Shewa Robit', 
        'Enemay', 'Agew Awi', 'North Gondar', 'South Gondar', 'East Gojjam', 'West Gojjam', 
        'North Wollo', 'South Wollo', 'Oromia', 'Wag Hemra'
      ]
    },
    {
      name: 'Benishangul-Gumuz',
      localGovernments: [
        'Asosa', 'Metekel', 'Kamashi', 'Mao-Komo'
      ]
    },
    {
      name: 'Dire Dawa',
      localGovernments: [
        'Dire Dawa City', 'Gurgura', 'Dechatu'
      ]
    },
    {
      name: 'Gambela',
      localGovernments: [
        'Gambela', 'Agnuak', 'Nuer', 'Mejeng'
      ]
    },
    {
      name: 'Harari',
      localGovernments: [
        'Harar City', 'Amir-Nur', 'Abadir', 'Shenkor', 'JinEvali', 'Aboker', 'Hakim', 'Sofi', 'Erer', 'Dire-Teyara'
      ]
    },
    {
      name: 'Oromia',
      localGovernments: [
        'Adama', 'Jimma', 'Bishoftu', 'Addis Ababa Surrounding', 'West Shewa', 'East Shewa', 
        'North Shewa', 'South West Shewa', 'Arsi', 'Bale', 'Borena', 'East Hararghe', 
        'West Hararghe', 'Illubabor', 'Jimma', 'Kelem Welega', 'West Welega', 'East Welega', 
        'Horo Gudru Welega', 'South West Shewa', 'Guji', 'West Arsi', 'West Guji'
      ]
    },
    {
      name: 'Sidama',
      localGovernments: [
        'Hawassa', 'Aleta Wondo', 'Wondo Genet', 'Yirgalem', 'Dale', 'Hula', 'Boricha', 'Loko Abaya', 'Malga'
      ]
    },
    {
      name: 'Somali',
      localGovernments: [
        'Jijiga', 'Degehabur', 'Kebri Beyah', 'Kebri Dahar', 'Gode', 'Warder', 'Shinile', 
        'Afder', 'Liben', 'Fafan', 'Sitti', 'Nogob', 'Erer', 'Dollo', 'Korahe'
      ]
    },
    {
      name: 'South West Ethiopia Peoples',
      localGovernments: [
        'Bonga', 'Mizan-Aman', 'Tepi', 'Sheka', 'Keffa', 'Bench Sheko', 'Dawro', 'West Omo'
      ]
    },
    {
      name: 'Southern Nations, Nationalities, and Peoples',
      localGovernments: [
        'Hawassa', 'Wolaita Sodo', 'Arba Minch', 'Dila', 'Hosaena', 'Butajira', 'Worabe', 
        'Durame', 'Mizan-Aman', 'Bonga', 'Jinka', 'Konso', 'Alaba', 'Gamo Gofa', 'Gedeo', 
        'Gurage', 'Hadiya', 'Kembata Tembaro', 'Silt\'e', 'Wolaita', 'Yem', 'Konso', 'Basketo', 'Dawro', 'Konta'
      ]
    },
    {
      name: 'Tigray',
      localGovernments: [
        'Mekelle', 'Adigrat', 'Axum', 'Adwa', 'Shire', 'Humera', 'Alamata', 'Korem', 'Maychew', 
        'Wukro', 'Abiy Addi', 'Enderta', 'Raya Azebo', 'Tselemti', 'North Western', 'Central', 
        'Eastern', 'Southern', 'South Eastern', 'Mekelle Special Zone'
      ]
    },
    {
      name: 'South West Ethiopia',
      localGovernments: [
        'Bench Sheko', 'Dawro', 'Keffa', 'Sheka', 'West Omo', 'Konta'
      ]
    }
  ]
},
  {
    name: 'Fiji',
    code: 'FJ',
    states: [
      { name: 'Central', localGovernments: ['Suva', 'Nasinu', 'Nausori'] },
      { name: 'Western', localGovernments: ['Lautoka', 'Nadi', 'Ba'] }
    ]
  },
  {
    name: 'Finland',
    code: 'FI',
    states: [
      { name: 'Uusimaa', localGovernments: ['Helsinki', 'Espoo', 'Vantaa'] },
      { name: 'Pirkanmaa', localGovernments: ['Tampere', 'Nokia', 'Ylöjärvi'] }
    ]
  },
  {
    name: 'France',
    code: 'FR',
    states: [
      { name: 'Île-de-France', localGovernments: ['Paris', 'Versailles', 'Nanterre'] },
      { name: 'Provence-Alpes-Côte d\'Azur', localGovernments: ['Marseille', 'Nice', 'Toulon'] },
      { name: 'Auvergne-Rhône-Alpes', localGovernments: ['Lyon', 'Grenoble', 'Saint-Étienne'] }
    ]
  },
  {
  name: 'Gabon',
  code: 'GA',
  states: [
    {
      name: 'Estuaire',
      localGovernments: [
        'Libreville', 'Owendo', 'Akanda', 'Ntoum', 'Cocobeach', 'Kango', 'Libreville Department'
      ]
    },
    {
      name: 'Haut-Ogooué',
      localGovernments: [
        'Franceville', 'Moanda', 'Okondja', 'Lékoni', 'Lékori', 'Lébamba', 'Mounana', 'Bongoville', 'Mpassa', 'Lemboumbi-Leyou', 'Plateaux', 'Sébé-Brikolo'
      ]
    },
    {
      name: 'Moyen-Ogooué',
      localGovernments: [
        'Lambaréné', 'Ndjolé', 'Ogooué et des Lacs'
      ]
    },
    {
      name: 'Ngounié',
      localGovernments: [
        'Mouila', 'Mandji', 'Ndendé', 'Fougamou', 'Mbigou', 'Malinga', 'Boumi-Louetsi', 'Dola', 'Douya-Onoy', 'Louetsi-Wano', 'Tsamba-Magotsi'
      ]
    },
    {
      name: 'Nyanga',
      localGovernments: [
        'Tchibanga', 'Mayumba', 'Moabi', 'Moucambou', 'Doutsila', 'Haute-Banio', 'Mongo', 'Basse-Banio', 'Douigni'
      ]
    },
    {
      name: 'Ogooué-Ivindo',
      localGovernments: [
        'Makokou', 'Ivindo', 'Lopé', 'Mékambo', 'Zadié', 'Ogooué et Létili'
      ]
    },
    {
      name: 'Ogooué-Lolo',
      localGovernments: [
        'Koulamoutou', 'Lastoursville', 'Pana', 'Lolo-Bouenguidi', 'Lombo-Bouenguidi', 'Mouloundou'
      ]
    },
    {
      name: 'Ogooué-Maritime',
      localGovernments: [
        'Port-Gentil', 'Omboué', 'Ndjolé', 'Bendjé', 'Etimboué', 'Ndougou'
      ]
    },
    {
      name: 'Woleu-Ntem',
      localGovernments: [
        'Oyem', 'Bitam', 'Mitzic', 'Médouneu', 'Minvoul', 'Okano', 'Haut-Komo', 'Ntem', 'Woleu'
      ]
    }
  ]
},
  {
  name: 'Gambia',
  code: 'GM',
  states: [
    {
      name: 'Banjul',
      localGovernments: [
        'Banjul Central', 'Banjul North', 'Banjul South'
      ]
    },
    {
      name: 'Kanifing',
      localGovernments: [
        'Serekunda', 'Bakau', 'Kanifing South', 'Kanifing East', 'Kanifing West', 
        'Bakoteh', 'Manjai', 'Tallinding', 'Ebo Town', 'Latrikunda'
      ]
    },
    {
      name: 'Brikama',
      localGovernments: [
        'Brikama North', 'Brikama South', 'Brikama West', 'Brikama Central', 
        'Busumbala', 'Kombo Central', 'Kombo East', 'Kombo North', 'Kombo South'
      ]
    },
    {
      name: 'Mansa Konko',
      localGovernments: [
        'Jarra East', 'Jarra Central', 'Jarra West', 'Kiang East', 'Kiang Central', 'Kiang West'
      ]
    },
    {
      name: 'Kerewan',
      localGovernments: [
        'Lower Niumi', 'Upper Niumi', 'Jokadu', 'Lower Badibu', 'Central Badibu', 'Upper Badibu', 'Illiasa', 'Sabach Sanjal'
      ]
    },
    {
      name: 'Kuntaur',
      localGovernments: [
        'Lower Saloum', 'Upper Saloum', 'Nianija', 'Niani', 'Sami'
      ]
    },
    {
      name: 'Janjanbureh',
      localGovernments: [
        'Lower Fulladu West', 'Upper Fulladu West', 'Niamina East', 'Niamina West', 'Niamina Dankunku', 'Janjanbureh'
      ]
    },
    {
      name: 'Basse',
      localGovernments: [
        'Tumana', 'Kantora', 'Sandu', 'Wuli East', 'Wuli West'
      ]
    }
  ]
},
  {
    name: 'Georgia',
    code: 'GE',
    states: [
      { name: 'Tbilisi', localGovernments: ['Tbilisi City', 'Rustavi', 'Mtskheta'] },
      { name: 'Adjara', localGovernments: ['Batumi', 'Kobuleti', 'Khelvachauri'] }
    ]
  },
  {
    name: 'Germany',
    code: 'DE',
    states: [
      { name: 'Bavaria', localGovernments: ['Munich', 'Nuremberg', 'Augsburg'] },
      { name: 'North Rhine-Westphalia', localGovernments: ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'] },
      { name: 'Baden-Württemberg', localGovernments: ['Stuttgart', 'Mannheim', 'Karlsruhe'] },
      { name: 'Berlin', localGovernments: ['Mitte', 'Charlottenburg', 'Kreuzberg'] }
    ]
  },
 {
  name: 'Ghana',
  code: 'GH',
  states: [
    {
      name: 'Greater Accra',
      localGovernments: [
        'Accra Metropolitan', 'Tema Metropolitan', 'Adenta Municipal', 'Ashaiman Municipal', 'Ga Central Municipal', 
        'Ga East Municipal', 'Ga West Municipal', 'Ga South Municipal', 'Ga North Municipal', 'Ledzokuku Municipal', 
        'Krowor Municipal', 'La Dade Kotopon Municipal', 'La Nkwantanang Madina Municipal', 'Ayawaso Central Municipal', 
        'Ayawaso East Municipal', 'Ayawaso North Municipal', 'Ayawaso West Municipal', 'Korle Klottey Municipal', 
        'Okaikwei North Municipal', 'Weija Gbawe Municipal'
      ]
    },
    {
      name: 'Ashanti',
      localGovernments: [
        'Kumasi Metropolitan', 'Obuasi Municipal', 'Ejisu Municipal', 'Asokwa Municipal', 'Bekwai Municipal', 
        'Ejura Sekyedumase Municipal', 'Mampong Municipal', 'Oforikrom Municipal', 'Old Tafo Municipal', 
        'Asokore Mampong Municipal', 'Kwadaso Municipal', 'Suame Municipal', 'Afigya-Kwabre South', 'Afigya-Kwabre North', 
        'Ahafo Ano South', 'Ahafo Ano North', 'Amansie Central', 'Amansie West', 'Amansie South', 'Asante Akim Central', 
        'Asante Akim North', 'Asante Akim South', 'Atwima Kwanwoma', 'Atwima Mponua', 'Atwima Nwabiagya', 
        'Bosome Freho', 'Bosomtwe', 'Juaben Municipal', 'Kwabre East', 'Offinso Municipal', 'Offinso North', 
        'Sekyere Afram Plains', 'Sekyere Central', 'Sekyere East', 'Sekyere Kumawu', 'Sekyere South'
      ]
    },
    {
      name: 'Western',
      localGovernments: [
        'Sekondi Takoradi Metropolitan', 'Ahanta West Municipal', 'Effia Kwesimintsim Municipal', 'Ellembelle', 
        'Jomoro Municipal', 'Nzema East Municipal', 'Shama', 'Wassa East', 'Wassa Amenfi East', 'Wassa Amenfi West', 
        'Prestea-Huni Valley Municipal', 'Tarkwa Nsuaem Municipal', 'Bibiani Anhwiaso Bekwai Municipal', 
        'Sefwi Wiawso Municipal', 'Sefwi Akontombra', 'Bodi', 'Juaboso', 'Suaman'
      ]
    },
    {
      name: 'Western North',
      localGovernments: [
        'Sefwi Wiawso Municipal', 'Bibiani Anhwiaso Bekwai Municipal', 'Bodi', 'Juaboso', 'Akontombra', 
        'Sefwi Akontombra', 'Suaman', 'Aowin Municipal', 'Bia East', 'Bia West'
      ]
    },
    {
      name: 'Central',
      localGovernments: [
        'Cape Coast Metropolitan', 'Abura Asebu Kwamankese', 'Agona East', 'Agona West Municipal', 'Ajumako/Enyan/Essiam', 
        'Asikuma/Odoben/Brakwa', 'Assin Central Municipal', 'Assin North', 'Assin South', 'Awutu Senya East Municipal', 
        'Awutu Senya West', 'Effutu Municipal', 'Ekumfi', 'Gomoa East', 'Gomoa Central', 'Gomoa West', 
        'Komenda/Edina/Eguafo/Abirem Municipal', 'Mfantsiman Municipal', 'Twifo Atti Morkwa', 'Twifo/Heman/Lower Denkyira', 
        'Upper Denkyira East Municipal', 'Upper Denkyira West'
      ]
    },
    {
      name: 'Eastern',
      localGovernments: [
        'Koforidua Municipal', 'New Juaben North Municipal', 'Akuapim North Municipal', 'Akuapim South', 
        'Akyemansa', 'Asuogyaman', 'Atiwa East', 'Atiwa West', 'Ayensuano', 'Birim Central Municipal', 
        'Birim North', 'Denkyembour', 'Fanteakwa North', 'Fanteakwa South', 'Kwaebibirem Municipal', 
        'Kwahu Afram Plains North', 'Kwahu Afram Plains South', 'Kwahu East', 'Kwahu South', 'Kwahu West Municipal', 
        'Lower Manya Krobo Municipal', 'Upper Manya Krobo', 'Msuea West Municipal', 'Nsuea East Municipal', 
        'Okere', 'Suhum Municipal', 'Upper West Akim', 'West Akim Municipal', 'Yilo Krobo Municipal'
      ]
    },
    {
      name: 'Volta',
      localGovernments: [
        'Ho Municipal', 'Adaklu', 'Afadzato South', 'Agotime Ziope', 'Akatsi North', 'Akatsi South', 
        'Anloga', 'Central Tongu', 'Ho West', 'Hohoe Municipal', 'Keta Municipal', 'Ketu North Municipal', 
        'Ketu South Municipal', 'Kpando Municipal', 'North Dayi', 'North Tongu', 'South Dayi', 'South Tongu'
      ]
    },
    {
      name: 'Oti',
      localGovernments: [
        'Dambai Municipal', 'Biakoye', 'Jasikan', 'Kadjebi', 'Krachi East Municipal', 'Krachi Nchumuru', 
        'Krachi West', 'Nkwanta North', 'Nkwanta South Municipal'
      ]
    },
    {
      name: 'Northern',
      localGovernments: [
        'Tamale Metropolitan', 'Gushegu Municipal', 'Karaga', 'Kpandai', 'Kumbungu', 'Mion', 'Nanton', 
        'Nanumba North Municipal', 'Nanumba South', 'Saboba', 'Sagnarigu Municipal', 'Savelugu Municipal', 
        'Tatale Sanguli', 'Tolon', 'Yendi Municipal', 'Zabzugu'
      ]
    },
    {
      name: 'North East',
      localGovernments: [
        'Nalerigu Gambaga Municipal', 'Bunkpurugu Nyankpanduri', 'Chereponi', 'East Mamprusi Municipal', 
        'Mamprugu Moagduri', 'West Mamprusi Municipal', 'Yunyoo Nasuan'
      ]
    },
    {
      name: 'Savannah',
      localGovernments: [
        'Damongo Municipal', 'Bole', 'Central Gonja', 'East Gonja Municipal', 'North Gonja', 
        'North East Gonja', 'West Gonja Municipal', 'Sawla Tuna Kalba'
      ]
    },
    {
      name: 'Upper East',
      localGovernments: [
        'Bolgatanga Municipal', 'Bawku Municipal', 'Binde', 'Bongo', 'Builsa North Municipal', 
        'Builsa South', 'Garu', 'Kassena Nankana Municipal', 'Kassena Nankana West', 'Nabdam', 
        'Pusiga', 'Talensi', 'Tempane'
      ]
    },
    {
      name: 'Upper West',
      localGovernments: [
        'Wa Municipal', 'Daffiama Bussie Issa', 'Jirapa Municipal', 'Lambussie Karni', 'Lawra Municipal', 
        'Nadowli Kaleo', 'Nandom Municipal', 'Sissala East Municipal', 'Sissala West', 'Wa East', 'Wa West'
      ]
    },
    {
      name: 'Bono',
      localGovernments: [
        'Sunyani Municipal', 'Banda', 'Berekum Municipal', 'Berekum West', 'Dormaa Central Municipal', 
        'Dormaa East', 'Dormaa West', 'Jaman North', 'Jaman South Municipal', 'Sunyani West Municipal', 
        'Tain', 'Wenchi Municipal'
      ]
    },
    {
      name: 'Bono East',
      localGovernments: [
        'Techiman Municipal', 'Atebubu Amantin Municipal', 'Kintampo North Municipal', 'Kintampo South', 
        'Nkoranza North', 'Nkoranza South Municipal', 'Pru East', 'Pru West', 'Sene East', 'Sene West', 
        'Techiman North'
      ]
    },
    {
      name: 'Ahafo',
      localGovernments: [
        'Goaso Municipal', 'Asunafo North Municipal', 'Asunafo South', 'Asutifi North', 
        'Asutifi South', 'Tano North Municipal', 'Tano South Municipal'
      ]
    }
  ]
},
  {
    name: 'Greece',
    code: 'GR',
    states: [
      { name: 'Attica', localGovernments: ['Athens', 'Piraeus', 'Peristeri'] },
      { name: 'Central Macedonia', localGovernments: ['Thessaloniki', 'Katerini', 'Serres'] }
    ]
  },
  {
    name: 'Grenada',
    code: 'GD',
    states: [
      { name: 'Saint George', localGovernments: ['St. George\'s'] },
      { name: 'Saint Andrew', localGovernments: ['Grenville'] }
    ]
  },
  {
    name: 'Guatemala',
    code: 'GT',
    states: [
      { name: 'Guatemala', localGovernments: ['Guatemala City', 'Mixco', 'Villa Nueva'] },
      { name: 'Quetzaltenango', localGovernments: ['Quetzaltenango City', 'Salcajá'] }
    ]
  },
  {
  name: 'Guinea',
  code: 'GN',
  states: [
    {
      name: 'Conakry',
      localGovernments: [
        'Kaloum', 'Dixinn', 'Ratoma', 'Matam', 'Matoto'
      ]
    },
    {
      name: 'Boké',
      localGovernments: [
        'Boké', 'Boffa', 'Fria', 'Gaoual', 'Koundara'
      ]
    },
    {
      name: 'Faranah',
      localGovernments: [
        'Faranah', 'Dabola', 'Dinguiraye', 'Kissidougou'
      ]
    },
    {
      name: 'Kankan',
      localGovernments: [
        'Kankan', 'Kérouané', 'Kouroussa', 'Mandiana', 'Siguiri'
      ]
    },
    {
      name: 'Kindia',
      localGovernments: [
        'Kindia', 'Coyah', 'Dubréka', 'Forécariah', 'Télimélé'
      ]
    },
    {
      name: 'Labé',
      localGovernments: [
        'Labé', 'Koubia', 'Lélouma', 'Mali', 'Tougué'
      ]
    },
    {
      name: 'Mamou',
      localGovernments: [
        'Mamou', 'Dalaba', 'Pita'
      ]
    },
    {
      name: 'Nzérékoré',
      localGovernments: [
        'Nzérékoré', 'Beyla', 'Guéckédou', 'Lola', 'Macenta', 'Yomou'
      ]
    }
  ]
},
  {
    name: 'Guyana',
    code: 'GY',
    states: [
      { name: 'Demerara-Mahaica', localGovernments: ['Georgetown', 'Diamond', 'Vreed-en-Hoop'] },
      { name: 'Essequibo Islands-West Demerara', localGovernments: ['Parika', 'Vreed-en-Hoop'] }
    ]
  },
  {
    name: 'Haiti',
    code: 'HT',
    states: [
      { name: 'Ouest', localGovernments: ['Port-au-Prince', 'Delmas', 'Pétion-Ville'] },
      { name: 'Artibonite', localGovernments: ['Gonaïves', 'Saint-Marc', 'Dessalines'] }
    ]
  },
  {
    name: 'Honduras',
    code: 'HN',
    states: [
      { name: 'Francisco Morazán', localGovernments: ['Tegucigalpa', 'Comayagüela'] },
      { name: 'Cortés', localGovernments: ['San Pedro Sula', 'Choloma'] }
    ]
  },
  {
    name: 'Hungary',
    code: 'HU',
    states: [
      { name: 'Budapest', localGovernments: ['District I', 'District V', 'District XIII'] },
      { name: 'Pest', localGovernments: ['Érd', 'Gödöllő', 'Dunakeszi'] }
    ]
  },
  {
    name: 'Iceland',
    code: 'IS',
    states: [
      { name: 'Capital Region', localGovernments: ['Reykjavík', 'Kópavogur', 'Hafnarfjörður'] },
      { name: 'Southern Peninsula', localGovernments: ['Reykjanesbær', 'Grindavík', 'Sandgerði'] }
    ]
  },
  {
    name: 'India',
    code: 'IN',
    states: [
      { name: 'Maharashtra', localGovernments: ['Mumbai', 'Pune', 'Nagpur', 'Thane'] },
      { name: 'Delhi', localGovernments: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi'] },
      { name: 'Karnataka', localGovernments: ['Bangalore', 'Mysore', 'Mangalore'] },
      { name: 'Tamil Nadu', localGovernments: ['Chennai', 'Coimbatore', 'Madurai'] },
      { name: 'West Bengal', localGovernments: ['Kolkata', 'Howrah', 'Durgapur'] },
      { name: 'Gujarat', localGovernments: ['Ahmedabad', 'Surat', 'Vadodara'] },
      { name: 'Rajasthan', localGovernments: ['Jaipur', 'Jodhpur', 'Udaipur'] },
      { name: 'Uttar Pradesh', localGovernments: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'] }
    ]
  },
  {
    name: 'Indonesia',
    code: 'ID',
    states: [
      { name: 'Jakarta', localGovernments: ['Central Jakarta', 'South Jakarta', 'East Jakarta'] },
      { name: 'West Java', localGovernments: ['Bandung', 'Bekasi', 'Depok'] },
      { name: 'East Java', localGovernments: ['Surabaya', 'Malang', 'Sidoarjo'] }
    ]
  },
  {
    name: 'Iran',
    code: 'IR',
    states: [
      { name: 'Tehran', localGovernments: ['Tehran City', 'Rey', 'Shemiranat'] },
      { name: 'Isfahan', localGovernments: ['Isfahan City', 'Kashan', 'Najafabad'] }
    ]
  },
  {
    name: 'Iraq',
    code: 'IQ',
    states: [
      { name: 'Baghdad', localGovernments: ['Baghdad City', 'Sadr City', 'Kadhimiya'] },
      { name: 'Basra', localGovernments: ['Basra City', 'Al-Zubair'] }
    ]
  },
  {
    name: 'Ireland',
    code: 'IE',
    states: [
      { name: 'Leinster', localGovernments: ['Dublin', 'Cork', 'Limerick', 'Galway'] },
      { name: 'Munster', localGovernments: ['Cork City', 'Limerick City', 'Waterford'] }
    ]
  },
  {
    name: 'Israel',
    code: 'IL',
    states: [
      { name: 'Tel Aviv', localGovernments: ['Tel Aviv-Yafo', 'Ramat Gan', 'Givatayim'] },
      { name: 'Jerusalem', localGovernments: ['Jerusalem Municipality'] }
    ]
  },
  {
    name: 'Italy',
    code: 'IT',
    states: [
      { name: 'Lazio', localGovernments: ['Rome', 'Latina', 'Frosinone'] },
      { name: 'Lombardy', localGovernments: ['Milan', 'Bergamo', 'Brescia'] },
      { name: 'Campania', localGovernments: ['Naples', 'Salerno', 'Caserta'] }
    ]
  },
  {
  name: 'Ivory Coast',
  code: 'CI',
  states: [
    {
      name: 'Abidjan',
      localGovernments: [
        'Abidjan Autonomous District', 'Cocody', 'Yopougon', 'Abobo', 'Adjamé', 'Attécoubé', 
        'Bingerville', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Treichville'
      ]
    },
    {
      name: 'Bas-Sassandra',
      localGovernments: [
        'San-Pédro', 'Sassandra', 'Tabou'
      ]
    },
    {
      name: 'Comoé',
      localGovernments: [
        'Abengourou', 'Agnibilékrou', 'Bondoukou'
      ]
    },
    {
      name: 'Denguélé',
      localGovernments: [
        'Odienné', 'Madinani'
      ]
    },
    {
      name: 'Gôh-Djiboua',
      localGovernments: [
        'Gagnoa', 'Oumé'
      ]
    },
    {
      name: 'Lacs',
      localGovernments: [
        'Dimbokro', 'Bocanda', 'Toumodi'
      ]
    },
    {
      name: 'Lagunes',
      localGovernments: [
        'Dabou', 'Grand-Lahou', 'Tiassalé'
      ]
    },
    {
      name: 'Montagnes',
      localGovernments: [
        'Man', 'Bangolo', 'Biankouma', 'Danané', 'Kouibly', 'Sipilou', 'Toulépleu', 'Zouan-Hounien'
      ]
    },
    {
      name: 'Sassandra-Marahoué',
      localGovernments: [
        'Daloa', 'Issia', 'Vavoua', 'Bouaflé', 'Sinfra', 'Zuénoula'
      ]
    },
    {
      name: 'Savanes',
      localGovernments: [
        'Korhogo', 'Boundiali', 'Ferkessédougou', 'Dikodougou', 'Kong', 'Ouangolodougou', 'Tengréla'
      ]
    },
    {
      name: 'Vallée du Bandama',
      localGovernments: [
        'Bouaké', 'Katiola', 'Sakassou', 'Beoumi', 'Botro', 'Dabakala'
      ]
    },
    {
      name: 'Woroba',
      localGovernments: [
        'Séguéla', 'Kani', 'Mankono'
      ]
    },
    {
      name: 'Yamoussoukro',
      localGovernments: [
        'Yamoussoukro Autonomous District', 'Attiégouakro', 'Lolobo'
      ]
    },
    {
      name: 'Zanzan',
      localGovernments: [
        'Bouna', 'Tanda', 'Bondoukou', 'Koun-Fao', 'Sandégué', 'Transua'
      ]
    }
  ]
},
  {
    name: 'Jamaica',
    code: 'JM',
    states: [
      { name: 'Kingston', localGovernments: ['Kingston City', 'St. Andrew'] },
      { name: 'Saint Catherine', localGovernments: ['Spanish Town', 'Portmore'] }
    ]
  },
  {
    name: 'Japan',
    code: 'JP',
    states: [
      { name: 'Tokyo', localGovernments: ['Chiyoda', 'Chuo', 'Minato', 'Shinjuku', 'Shibuya'] },
      { name: 'Osaka', localGovernments: ['Osaka City', 'Sakai', 'Higashiosaka'] },
      { name: 'Kyoto', localGovernments: ['Kyoto City', 'Uji', 'Kameoka'] }
    ]
  },
  {
    name: 'Jordan',
    code: 'JO',
    states: [
      { name: 'Amman', localGovernments: ['Amman City', 'Zarqa', 'Russeifa'] },
      { name: 'Irbid', localGovernments: ['Irbid City', 'Ramtha', 'Mafraq'] }
    ]
  },
  {
    name: 'Kazakhstan',
    code: 'KZ',
    states: [
      { name: 'Almaty', localGovernments: ['Almaty City', 'Talgar', 'Kapshagay'] },
      { name: 'Nur-Sultan', localGovernments: ['Nur-Sultan City', 'Kokshetau', 'Petropavl'] }
    ]
  },
  {
  name: 'Kenya',
  code: 'KE',
  states: [
    {
      name: 'Nairobi',
      localGovernments: [
        'Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra', 'Roysambu', 
        'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 
        'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare'
      ]
    },
    {
      name: 'Mombasa',
      localGovernments: [
        'Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni', 'Mvita'
      ]
    },
    {
      name: 'Kwale',
      localGovernments: [
        'Matuga', 'Msambweni', 'Lungalunga', 'Kinango'
      ]
    },
    {
      name: 'Kilifi',
      localGovernments: [
        'Kilifi North', 'Kilifi South', 'Kaloleni', 'Rabai', 'Ganze', 'Malindi', 'Magarini'
      ]
    },
    {
      name: 'Tana River',
      localGovernments: [
        'Garsen', 'Galole', 'Bura'
      ]
    },
    {
      name: 'Lamu',
      localGovernments: [
        'Lamu East', 'Lamu West'
      ]
    },
    {
      name: 'Taita-Taveta',
      localGovernments: [
        'Taveta', 'Wundanyi', 'Mwatate', 'Voi'
      ]
    },
    {
      name: 'Garissa',
      localGovernments: [
        'Garissa Township', 'Balambala', 'Lagdera', 'Dadaab', 'Fafi', 'Ijara'
      ]
    },
    {
      name: 'Wajir',
      localGovernments: [
        'Wajir East', 'Wajir West', 'Wajir North', 'Wajir South', 'Tarbaj', 'Eldas'
      ]
    },
    {
      name: 'Mandera',
      localGovernments: [
        'Mandera East', 'Mandera West', 'Mandera North', 'Banissa', 'Lafey', 'Kotulo'
      ]
    },
    {
      name: 'Marsabit',
      localGovernments: [
        'Moyale', 'North Horr', 'Saku', 'Laisamis'
      ]
    },
    {
      name: 'Isiolo',
      localGovernments: [
        'Isiolo North', 'Isiolo South', 'Garbatulla', 'Merti', 'Oldonyiro'
      ]
    },
    {
      name: 'Meru',
      localGovernments: [
        'Buuri', 'Igembe Central', 'Igembe North', 'Igembe South', 'Imenti Central', 
        'Imenti North', 'Imenti South', 'Tigania East', 'Tigania West'
      ]
    },
    {
      name: 'Tharaka-Nithi',
      localGovernments: [
        'Tharaka South', 'Tharaka North', 'Chuka', 'Igambangombe', 'Maara', 'Mwingi West'
      ]
    },
    {
      name: 'Embu',
      localGovernments: [
        'Manyatta', 'Runyenjes', 'Mbeere North', 'Mbeere South'
      ]
    },
    {
      name: 'Kitui',
      localGovernments: [
        'Kitui West', 'Kitui Central', 'Kitui Rural', 'Kitui South', 'Mwingi North', 
        'Mwingi Central', 'Mwitika', 'Kyuso'
      ]
    },
    {
      name: 'Machakos',
      localGovernments: [
        'Machakos Town', 'Mavoko', 'Mwala', 'Yatta', 'Kangundo', 'Kathiani', 'Matungulu'
      ]
    },
    {
      name: 'Makueni',
      localGovernments: [
        'Makueni', 'Kibwezi West', 'Kibwezi East', 'Kilome', 'Mbooni'
      ]
    },
    {
      name: 'Nyandarua',
      localGovernments: [
        'Kinangop', 'Kipipiri', 'Ol Kalou', 'Ol Joro Orok', 'Ndaragwa'
      ]
    },
    {
      name: 'Nyeri',
      localGovernments: [
        'Tetu', 'Kieni', 'Mathira East', 'Mathira West', 'Othaya', 'Mukurweini', 'Nyeri Town'
      ]
    },
    {
      name: 'Kirinyaga',
      localGovernments: [
        'Kirinyaga Central', 'Kirinyaga East', 'Kirinyaga West', 'Mwea East', 'Mwea West'
      ]
    },
    {
      name: 'Muranga',
      localGovernments: [
        'Kandara', 'Kigumo', 'Gatanga', 'Kangema', 'Mathioya', 'Kahuro', 'Muranga South'
      ]
    },
    {
      name: 'Kiambu',
      localGovernments: [
        'Gatundu South', 'Gatundu North', 'Juja', 'Thika Town', 'Ruiru', 'Githunguri', 
        'Kiambu Town', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari'
      ]
    },
    {
      name: 'Turkana',
      localGovernments: [
        'Turkana North', 'Turkana West', 'Turkana Central', 'Loima', 'Turkana South', 
        'Turkana East', 'Kibish'
      ]
    },
    {
      name: 'West Pokot',
      localGovernments: [
        'Kapenguria', 'Sigor', 'Kacheliba', 'Pokot South'
      ]
    },
    {
      name: 'Samburu',
      localGovernments: [
        'Samburu East', 'Samburu North', 'Samburu West'
      ]
    },
    {
      name: 'Trans-Nzoia',
      localGovernments: [
        'Kwanza', 'Endebess', 'Saboti', 'Kiminini', 'Cherangany'
      ]
    },
    {
      name: 'Uasin Gishu',
      localGovernments: [
        'Soy', 'Turbo', 'Moiben', 'Ainabkoi', 'Kapseret', 'Kesses'
      ]
    },
    {
      name: 'Elgeyo-Marakwet',
      localGovernments: [
        'Marakwet East', 'Marakwet West', 'Keiyo North', 'Keiyo South'
      ]
    },
    {
      name: 'Nandi',
      localGovernments: [
        'Chesumei', 'Emgwen', 'Mosop', 'Aldai', 'Tinderet', 'Nandi Hills'
      ]
    },
    {
      name: 'Baringo',
      localGovernments: [
        'Baringo Central', 'Baringo North', 'Baringo South', 'Eldama Ravine', 'Mogotio', 'Tiaty'
      ]
    },
    {
      name: 'Laikipia',
      localGovernments: [
        'Laikipia Central', 'Laikipia East', 'Laikipia North', 'Laikipia West', 'Nyahururu'
      ]
    },
    {
      name: 'Nakuru',
      localGovernments: [
        'Nakuru Town East', 'Nakuru Town West', 'Molo', 'Njoro', 'Naivasha', 'Gilgil', 
        'Kuresoi North', 'Kuresoi South', 'Subukia', 'Rongai', 'Bahati'
      ]
    },
    {
      name: 'Narok',
      localGovernments: [
        'Narok North', 'Narok South', 'Narok East', 'Narok West', 'Kilgoris', 'Emurua Dikirr'
      ]
    },
    {
      name: 'Kajiado',
      localGovernments: [
        'Kajiado North', 'Kajiado Central', 'Kajiado East', 'Kajiado West', 'Kajiado South'
      ]
    },
    {
      name: 'Kericho',
      localGovernments: [
        'Ainamoi', 'Belgut', 'Bureti', 'Kipkelion East', 'Kipkelion West', 'Soin/Sigowet'
      ]
    },
    {
      name: 'Bomet',
      localGovernments: [
        'Bomet Central', 'Bomet East', 'Chepalungu', 'Konoin', 'Sotik'
      ]
    },
    {
      name: 'Kakamega',
      localGovernments: [
        'Lurambi', 'Navakholo', 'Mumias West', 'Mumias East', 'Matungu', 'Butere', 
        'Khwisero', 'Shinyalu', 'Ikolomani', 'Lugari', 'Malava'
      ]
    },
    {
      name: 'Vihiga',
      localGovernments: [
        'Vihiga', 'Sabatia', 'Hamisi', 'Luanda', 'Emuhaya'
      ]
    },
    {
      name: 'Bungoma',
      localGovernments: [
        'Bungoma North', 'Bungoma South', 'Bungoma East', 'Bungoma West', 'Bungoma Central', 
        'Kimilili', 'Tongaren', 'Webuye East', 'Webuye West'
      ]
    },
    {
      name: 'Busia',
      localGovernments: [
        'Busia', 'Butula', 'Funyula', 'Nambale', 'Teso North', 'Teso South'
      ]
    },
    {
      name: 'Siaya',
      localGovernments: [
        'Ugenya', 'Ugunja', 'Alego Usonga', 'Gem', 'Bondo', 'Rarieda'
      ]
    },
    {
      name: 'Kisumu',
      localGovernments: [
        'Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'
      ]
    },
    {
      name: 'Homa Bay',
      localGovernments: [
        'Homa Bay Town', 'Kabondo Kasipul', 'Karachuonyo', 'Kasipul', 'Mbita', 'Ndhiwa', 
        'Rangwe', 'Suba'
      ]
    },
    {
      name: 'Migori',
      localGovernments: [
        'Migori', 'Awendo', 'Kuria East', 'Kuria West', 'Nyatike', 'Rongo', 'Suna East', 'Suna West'
      ]
    },
    {
      name: 'Kisii',
      localGovernments: [
        'Bonchari', 'South Mugirango', 'Bomachoge Borabu', 'Bobasi', 'Bomachoge Chache', 
        'Nyaribari Masaba', 'Nyaribari Chache', 'Kitutu Chache North', 'Kitutu Chache South'
      ]
    },
    {
      name: 'Nyamira',
      localGovernments: [
        'Borabu', 'Manga', 'Masaba North', 'Nyamira North', 'Nyamira South'
      ]
    }
  ]
},
  {
    name: 'Kiribati',
    code: 'KI',
    states: [
      { name: 'Gilbert Islands', localGovernments: ['Tarawa', 'Betio'] },
      { name: 'Line Islands', localGovernments: ['Kiritimati'] }
    ]
  },
  {
    name: 'Kuwait',
    code: 'KW',
    states: [
      { name: 'Al Asimah', localGovernments: ['Kuwait City', 'Kaifan', 'Dasma'] },
      { name: 'Hawalli', localGovernments: ['Hawalli', 'Salmiya', 'Rumaithiya'] }
    ]
  },
  {
    name: 'Kyrgyzstan',
    code: 'KG',
    states: [
      { name: 'Bishkek', localGovernments: ['Bishkek City', 'Leninsky', 'Oktyabrsky'] },
      { name: 'Chuy', localGovernments: ['Tokmok', 'Kara-Balta', 'Kant'] }
    ]
  },
  {
    name: 'Laos',
    code: 'LA',
    states: [
      { name: 'Vientiane', localGovernments: ['Vientiane Capital', 'Xaythany', 'Chanthabuly'] },
      { name: 'Luang Prabang', localGovernments: ['Luang Prabang City', 'Pak Ou', 'Xieng Ngeun'] }
    ]
  },
  {
    name: 'Latvia',
    code: 'LV',
    states: [
      { name: 'Riga', localGovernments: ['Riga City', 'Jūrmala', 'Jelgava'] },
      { name: 'Vidzeme', localGovernments: ['Valmiera', 'Cēsis', 'Sigulda'] }
    ]
  },
  {
    name: 'Lebanon',
    code: 'LB',
    states: [
      { name: 'Beirut', localGovernments: ['Beirut City', 'Achrafieh', 'Hamra'] },
      { name: 'Mount Lebanon', localGovernments: ['Jounieh', 'Byblos', 'Baabda'] }
    ]
  },
  {
    name: 'Lesotho',
    code: 'LS',
    states: [
      { name: 'Maseru', localGovernments: ['Maseru District', 'Maseru City'] },
      { name: 'Berea', localGovernments: ['Teyateyaneng'] }
    ]
  },
  {
  name: 'Liberia',
  code: 'LR',
  states: [
    {
      name: 'Bomi',
      localGovernments: [
        'Tubmanburg', 'Klain', 'Senjeh', 'Dewoin'
      ]
    },
    {
      name: 'Bong',
      localGovernments: [
        'Gbarnga', 'Salala', 'Sanoyea', 'Zota', 'Phebe', 'Jorquelleh', 'Kokoyah', 'Fuamah', 'Suakoko'
      ]
    },
    {
      name: 'Gbarpolu',
      localGovernments: [
        'Bopolu', 'Belleh', 'Bokomu', 'Kongba', 'Gounwolala'
      ]
    },
    {
      name: 'Grand Bassa',
      localGovernments: [
        'Buchanan', 'District #1', 'District #2', 'District #3', 'District #4', 'Owensgrove', 'St. John River City'
      ]
    },
    {
      name: 'Grand Cape Mount',
      localGovernments: [
        'Robertsport', 'Tewor', 'Porkpa', 'Commonwealth', 'Gola Konneh'
      ]
    },
    {
      name: 'Grand Gedeh',
      localGovernments: [
        'Zwedru', 'Tchien', 'Gbarzon', 'Konobo'
      ]
    },
    {
      name: 'Grand Kru',
      localGovernments: [
        'Barclayville', 'Borough', 'Bupper', 'Nimba', 'Twedru'
      ]
    },
    {
      name: 'Lofa',
      localGovernments: [
        'Voinjama', 'Foya', 'Kolahun', 'Salayea', 'Zorzor', 'Quardu Gboni', 'Vahun'
      ]
    },
    {
      name: 'Margibi',
      localGovernments: [
        'Kakata', 'Gibson', 'Marshall', 'Firestone', 'Mambah-Kaba'
      ]
    },
    {
      name: 'Maryland',
      localGovernments: [
        'Harper', 'Barrobo', 'Pleebo/Sodoken', 'Karluway #1', 'Karluway #2'
      ]
    },
    {
      name: 'Montserrado',
      localGovernments: [
        'Monrovia', 'Paynesville', 'Bensonville', 'Careysburg', 'Todee', 'St. Paul River', 'Commonwealth', 'Greater Monrovia'
      ]
    },
    {
      name: 'Nimba',
      localGovernments: [
        'Ganta', 'Sanniquellie', 'Yekepa', 'Tappita', 'Zwedru', 'Saclepea', 'Bahn', 'Boe & Quilla', 'Gbehlay-Geh', 'Gbi & Doru', 'Kparblee', 'Meinpea-Mahn', 'Wea-Gbehy-Mahn', 'Yarmein', 'Zoe-Gbao'
      ]
    },
    {
      name: 'River Cess',
      localGovernments: [
        'Cestos City', 'Bearwor', 'Doedain', 'Fen River', 'Jo River', 'Norwein', 'Sam Gbalor', 'Zartlahn'
      ]
    },
    {
      name: 'River Gee',
      localGovernments: [
        'Fish Town', 'Gbeapo', 'Glaro', 'Karforh', 'Nanee', 'Nyenawliken', 'Potupo', 'Sarbo', 'Tuobo'
      ]
    },
    {
      name: 'Sinoe',
      localGovernments: [
        'Greenville', 'Butaw', 'Dugbe River', 'Jaedae Jaedepo', 'Juarzon', 'Kpayan', 'Kulu Shaw Boe', 'Piankahn', 'Sanquin', 'Senneh', 'Bodae'
      ]
    }
  ]
},
 {
  name: 'Libya',
  code: 'LY',
  states: [
    {
      name: 'Tripoli',
      localGovernments: [
        'Tripoli District', 'Tajoura', 'Janzour', 'Ain Zara', 'Souq Al Jumaa', 'Hay Al Andalus', 
        'Abu Salim', 'Al Hadba', 'Al Khums', 'Swani', 'Qasr Bin Ghashir'
      ]
    },
    {
      name: 'Benghazi',
      localGovernments: [
        'Benghazi City', 'Sidi Khrebish', 'Al Hawari', 'Al Kwayfiya', 'Suluq', 'Benina'
      ]
    },
    {
      name: 'Misrata',
      localGovernments: [
        'Misrata City', 'Zliten', 'Tawergha', 'Qasr Ahmed', 'Abugrein', 'Zawyat Al Mahjub'
      ]
    },
    {
      name: 'Sabha',
      localGovernments: [
        'Sabha City', 'Murzuq', 'Ubari', 'Brak', 'Traghen', 'Ghat'
      ]
    },
    {
      name: 'Zawiya',
      localGovernments: [
        'Zawiya City', 'Sabratha', 'Surman', 'Al Ajaylat', 'Al Jumayl', 'Ras Lanuf'
      ]
    },
    {
      name: 'Bayda',
      localGovernments: [
        'Bayda City', 'Shahhat', 'Al Qubbah', 'Al Marj', 'Abyar', 'Kaminis'
      ]
    },
    {
      name: 'Derna',
      localGovernments: [
        'Derna City', 'Al Quba', 'Batta', 'Marmarica'
      ]
    },
    {
      name: 'Gharyan',
      localGovernments: [
        'Gharyan City', 'Al Asabah', 'Mizda', 'Yafran', 'Al Jazirah'
      ]
    },
    {
      name: 'Murqub',
      localGovernments: [
        'Khoms', 'Zliten', 'Misallatah', 'Tawergha', 'Qasr Khiyar'
      ]
    },
    {
      name: 'Jabal al Gharbi',
      localGovernments: [
        'Gharyan', 'Yafran', 'Mizda', 'Rujban', 'Al Qalaa'
      ]
    },
    {
      name: 'Nalut',
      localGovernments: [
        'Nalut City', 'Ghadames', 'Al Jawsh', 'Wazin', 'Tigi'
      ]
    },
    {
      name: 'Sirte',
      localGovernments: [
        'Sirte City', 'Abu Nujaym', 'Al Washkah', 'Harawa', 'Zallah'
      ]
    },
    {
      name: 'Wadi al Shatii',
      localGovernments: [
        'Brak', 'Adiri', 'Al Qatrun', 'Al Wigh', 'Al Zighan'
      ]
    },
    {
      name: 'Wadi al Hayaa',
      localGovernments: [
        'Ubari', 'Al Awaynat', 'Ghat', 'Al Barkat', 'Tajarhi'
      ]
    },
    {
      name: 'Jufra',
      localGovernments: [
        'Hun', 'Waddan', 'Sokna', 'Zella', 'Fuqaha'
      ]
    },
    {
      name: 'Kufra',
      localGovernments: [
        'Al Jawf', 'Tazirbu', 'Rebiana', 'Sarir', 'Talmin'
      ]
    },
    {
      name: 'Al Wahat',
      localGovernments: [
        'Ajdabiya', 'Jalu', 'Awjila', 'Marada', 'Jikharra'
      ]
    },
    {
      name: 'Al Marj',
      localGovernments: [
        'Al Marj City', 'Taknis', 'Al Abyar', 'Al Qubah', 'Bayda'
      ]
    },
    {
      name: 'Al Jufrah',
      localGovernments: [
        'Waddan', 'Hun', 'Sokna', 'Zella', 'Fuqaha'
      ]
    },
    {
      name: 'Al Murgub',
      localGovernments: [
        'Al Qubbah', 'Tocra', 'Al Abyar', 'Massa', 'Ghemines'
      ]
    },
    {
      name: 'Al Butnan',
      localGovernments: [
        'Tobruk', 'Bardia', 'Al Adam', 'Al Kufrah'
      ]
    },
    {
      name: 'Jafara',
      localGovernments: [
        'Aziziya', 'Al Maya', 'Al Jumayl', 'Al Assah', 'Al Zintan'
      ]
    }
  ]
},
  {
    name: 'Liechtenstein',
    code: 'LI',
    states: [
      { name: 'Vaduz', localGovernments: ['Vaduz'] },
      { name: 'Schaan', localGovernments: ['Schaan'] }
    ]
  },
  {
    name: 'Lithuania',
    code: 'LT',
    states: [
      { name: 'Vilnius', localGovernments: ['Vilnius City', 'Trakai', 'Šalčininkai'] },
      { name: 'Kaunas', localGovernments: ['Kaunas City', 'Kėdainiai', 'Jonava'] }
    ]
  },
  {
    name: 'Luxembourg',
    code: 'LU',
    states: [
      { name: 'Luxembourg', localGovernments: ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange'] },
      { name: 'Diekirch', localGovernments: ['Diekirch', 'Ettelbruck', 'Wiltz'] }
    ]
  },
  {
    name: 'Madagascar',
    code: 'MG',
    states: [
      { name: 'Analamanga', localGovernments: ['Antananarivo', 'Ambohidratrimo'] },
      { name: 'Atsinanana', localGovernments: ['Toamasina', 'Vatomandry'] }
    ]
  },
  {
  name: 'Malawi',
  code: 'MW',
  states: [
    {
      name: 'Central Region',
      localGovernments: [
        'Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota', 'Ntcheu', 'Ntchisi', 'Salima'
      ]
    },
    {
      name: 'Northern Region',
      localGovernments: [
        'Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi'
      ]
    },
    {
      name: 'Southern Region',
      localGovernments: [
        'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi', 'Mulanje', 'Mwanza', 
        'Neno', 'Nsanje', 'Phalombe', 'Thyolo', 'Zomba'
      ]
    }
  ]
},
  {
    name: 'Malaysia',
    code: 'MY',
    states: [
      { name: 'Kuala Lumpur', localGovernments: ['Bukit Bintang', 'Cheras', 'Kepong'] },
      { name: 'Selangor', localGovernments: ['Petaling Jaya', 'Shah Alam', 'Subang Jaya'] }
    ]
  },
  {
    name: 'Maldives',
    code: 'MV',
    states: [
      { name: 'Malé', localGovernments: ['Malé City', 'Hulhumalé', 'Vilimalé'] },
      { name: 'Addu City', localGovernments: ['Hithadhoo', 'Maradhoo', 'Feydhoo'] }
    ]
  },
  {
  name: 'Mali',
  code: 'ML',
  states: [
    {
      name: 'Bamako',
      localGovernments: [
        'Commune I', 'Commune II', 'Commune III', 'Commune IV', 'Commune V', 'Commune VI'
      ]
    },
    {
      name: 'Gao',
      localGovernments: [
        'Gao', 'Ansongo', 'Bourem', 'Ménaka'
      ]
    },
    {
      name: 'Kayes',
      localGovernments: [
        'Kayes', 'Kita', 'Nioro du Sahel', 'Bafoulabé', 'Diéma', 'Kéniéba', 'Yélimané'
      ]
    },
    {
      name: 'Kidal',
      localGovernments: [
        'Kidal', 'Abeïbara', 'Tessalit', 'Tin-Essako'
      ]
    },
    {
      name: 'Koulikoro',
      localGovernments: [
        'Koulikoro', 'Banamba', 'Dioïla', 'Kangaba', 'Kati', 'Kolokani', 'Nara'
      ]
    },
    {
      name: 'Mopti',
      localGovernments: [
        'Mopti', 'Bandiagara', 'Bankass', 'Djenné', 'Douentza', 'Koro', 'Ténenkou', 'Youwarou'
      ]
    },
    {
      name: 'Ségou',
      localGovernments: [
        'Ségou', 'Bla', 'Barouéli', 'Macina', 'Niono', 'San', 'Tominian'
      ]
    },
    {
      name: 'Sikasso',
      localGovernments: [
        'Sikasso', 'Bougouni', 'Kadiolo', 'Kolondiéba', 'Koutiala', 'Yanfolila', 'Yorosso'
      ]
    },
    {
      name: 'Taoudénit',
      localGovernments: [
        'Taoudénit', 'Achouratt', 'Al-Ourche', 'Boudje-Béha', 'Femaye', 'Fesssad', 'Boujbeha'
      ]
    },
    {
      name: 'Tombouctou',
      localGovernments: [
        'Tombouctou', 'Diré', 'Goundam', 'Gourma-Rharous', 'Niafunké'
      ]
    },
    {
      name: 'Ménaka',
      localGovernments: [
        'Ménaka', 'Andéramboukane', 'Inékar', 'Tidermène'
      ]
    }
  ]
},
  {
    name: 'Malta',
    code: 'MT',
    states: [
      { name: 'Southern Harbour', localGovernments: ['Valletta', 'Birgu', 'Senglea'] },
      { name: 'Northern', localGovernments: ['Mellieħa', 'St. Paul\'s Bay', 'Mġarr'] }
    ]
  },
  {
    name: 'Marshall Islands',
    code: 'MH',
    states: [
      { name: 'Majuro', localGovernments: ['Majuro Atoll'] },
      { name: 'Kwajalein', localGovernments: ['Kwajalein Atoll'] }
    ]
  },
  {
    name: 'Mauritius',
    code: 'MU',
    states: [
      { name: 'Port Louis', localGovernments: ['Port Louis District', 'Port Louis City'] },
      { name: 'Plaines Wilhems', localGovernments: ['Curepipe', 'Quatre Bornes'] }
    ]
  },
  {
    name: 'Mexico',
    code: 'MX',
    states: [
      { name: 'Mexico City', localGovernments: ['Cuauhtémoc', 'Iztapalapa', 'Gustavo A. Madero'] },
      { name: 'Jalisco', localGovernments: ['Guadalajara', 'Zapopan', 'Tlaquepaque'] },
      { name: 'Nuevo León', localGovernments: ['Monterrey', 'Guadalupe', 'San Nicolás'] }
    ]
  },
  {
    name: 'Micronesia',
    code: 'FM',
    states: [
      { name: 'Pohnpei', localGovernments: ['Palikir', 'Kolonia'] },
      { name: 'Chuuk', localGovernments: ['Weno'] }
    ]
  },
  {
    name: 'Moldova',
    code: 'MD',
    states: [
      { name: 'Chișinău', localGovernments: ['Chișinău Municipality', 'Botanica', 'Centru'] },
      { name: 'Bălți', localGovernments: ['Bălți City', 'Edineț', 'Fălești'] }
    ]
  },
  {
    name: 'Monaco',
    code: 'MC',
    states: [
      { name: 'Monaco', localGovernments: ['Monaco-Ville', 'Monte Carlo', 'La Condamine'] }
    ]
  },
  {
    name: 'Mongolia',
    code: 'MN',
    states: [
      { name: 'Ulaanbaatar', localGovernments: ['Ulaanbaatar City', 'Bayanzürkh', 'Chingeltei'] },
      { name: 'Darkhan-Uul', localGovernments: ['Darkhan', 'Sharyngol'] }
    ]
  },
  {
    name: 'Montenegro',
    code: 'ME',
    states: [
      { name: 'Podgorica', localGovernments: ['Podgorica Municipality', 'Tuzi', 'Zeta'] },
      { name: 'Nikšić', localGovernments: ['Nikšić Municipality'] }
    ]
  },
  {
    name: 'Morocco',
    code: 'MA',
    states: [
      { name: 'Casablanca-Settat', localGovernments: ['Casablanca', 'Settat', 'Mohammedia'] },
      { name: 'Rabat-Salé-Kénitra', localGovernments: ['Rabat', 'Salé', 'Kénitra'] }
    ]
  },
  {
    name: 'Mozambique',
    code: 'MZ',
    states: [
      { name: 'Maputo', localGovernments: ['Maputo City', 'Matola', 'Boane'] },
      { name: 'Nampula', localGovernments: ['Nampula City', 'Nacala'] }
    ]
  },
  {
    name: 'Myanmar',
    code: 'MM',
    states: [
      { name: 'Yangon', localGovernments: ['Yangon City', 'Insein', 'Mingaladon'] },
      { name: 'Mandalay', localGovernments: ['Mandalay City', 'Amarapura', 'Pyin Oo Lwin'] }
    ]
  },
  {
    name: 'Namibia',
    code: 'NA',
    states: [
      { name: 'Khomas', localGovernments: ['Windhoek', 'Rehoboth'] },
      { name: 'Erongo', localGovernments: ['Walvis Bay', 'Swakopmund'] }
    ]
  },
  {
    name: 'Nauru',
    code: 'NR',
    states: [
      { name: 'Yaren', localGovernments: ['Yaren District'] }
    ]
  },
  {
    name: 'Nepal',
    code: 'NP',
    states: [
      { name: 'Bagmati', localGovernments: ['Kathmandu', 'Lalitpur', 'Bhaktapur'] },
      { name: 'Gandaki', localGovernments: ['Pokhara', 'Gorkha', 'Lamjung'] }
    ]
  },
  {
    name: 'Netherlands',
    code: 'NL',
    states: [
      { name: 'North Holland', localGovernments: ['Amsterdam', 'Haarlem', 'Zaanstad'] },
      { name: 'South Holland', localGovernments: ['Rotterdam', 'The Hague', 'Leiden'] }
    ]
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    states: [
      { name: 'Auckland', localGovernments: ['Auckland City', 'Manukau', 'North Shore'] },
      { name: 'Wellington', localGovernments: ['Wellington City', 'Lower Hutt', 'Upper Hutt'] }
    ]
  },
  {
    name: 'Nicaragua',
    code: 'NI',
    states: [
      { name: 'Managua', localGovernments: ['Managua City', 'Tipitapa', 'Ciudad Sandino'] },
      { name: 'León', localGovernments: ['León City', 'Chinandega'] }
    ]
  },
  {
  name: 'Niger',
  code: 'NE',
  states: [
    {
      name: 'Agadez',
      localGovernments: [
        'Agadez',
        'Arlit',
        'Bilma',
        'Dabaga',
        'Iferouane',
        'Ingall',
        'Tchirozérine',
        'Tabelot',
        'Aderbissinat',
        'Tchintabaraden'
      ]
    },
    {
      name: 'Diffa',
      localGovernments: [
        'Diffa',
        'Mainé-Soroa',
        'Nguigmi',
        'Bosso',
        'Goudoumaria',
        'Kabléwa',
        'Ngalewa',
        'Chétimari'
      ]
    },
    {
      name: 'Dosso',
      localGovernments: [
        'Dosso',
        'Boboye',
        'Dogondoutchi',
        'Gaya',
        'Loga',
        'Tibiri',
        'Falmey',
        'Bana',
        'Dioundiou',
        'Karguibangou'
      ]
    },
    {
      name: 'Maradi',
      localGovernments: [
        'Maradi',
        'Aguié',
        'Dakoro',
        'Guidan Roumdji',
        'Madarounfa',
        'Mayahi',
        'Tessaoua',
        'Serkin Hausa',
        'Sarkin Yamma',
        'Tibiri'
      ]
    },
    {
      name: 'Niamey',
      localGovernments: [
        'Niamey I',
        'Niamey II',
        'Niamey III',
        'Niamey IV',
        'Niamey V',
        'Goudel',
        'Yantala',
        'Lazaret',
        'Gamkallé',
        'Kollo'
      ]
    },
    {
      name: 'Tahoua',
      localGovernments: [
        'Tahoua',
        'Abalak',
        'Birni-N\'Konni',
        'Bouza',
        'Illéla',
        'Keita',
        'Madaoua',
        'Malbaza',
        'Tchin-Tabaraden',
        'Tassara'
      ]
    },
    {
      name: 'Tillabéri',
      localGovernments: [
        'Tillabéri',
        'Filingué',
        'Kollo',
        'Ouallam',
        'Say',
        'Téra',
        'Bankilaré',
        'Gothèye',
        'Tondikiwindi',
        'Dargol'
      ]
    },
    {
      name: 'Zinder',
      localGovernments: [
        'Zinder',
        'Gouré',
        'Magaria',
        'Matameye',
        'Mirriah',
        'Tanout',
        'Belbédji',
        'Dungass',
        'Kantché',
        'Takeita'
      ]
    }
  ]
},
  {
    name: 'Nigeria',
    code: 'NG',
    states: [
      {
        name: 'Abia',
        localGovernments: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi']
      },
      {
        name: 'Adamawa',
        localGovernments: ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South']
      },
      {
        name: 'Akwa Ibom',
        localGovernments: ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo']
      },
      {
        name: 'Anambra',
        localGovernments: ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi']
      },
      {
        name: 'Bauchi',
        localGovernments: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki']
      },
      {
        name: 'Bayelsa',
        localGovernments: ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa']
      },
      {
        name: 'Benue',
        localGovernments: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Oturkpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya']
      },
      {
        name: 'Borno',
        localGovernments: ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani']
      },
      {
        name: 'Cross River',
        localGovernments: ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala']
      },
      {
        name: 'Delta',
        localGovernments: ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West']
      },
      {
        name: 'Ebonyi',
        localGovernments: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha']
      },
      {
        name: 'Edo',
        localGovernments: ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde']
      },
      {
        name: 'Ekiti',
        localGovernments: ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye']
      },
      {
        name: 'Enugu',
        localGovernments: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani']
      },
      {
        name: 'Gombe',
        localGovernments: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba']
      },
      {
        name: 'Imo',
        localGovernments: ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo']
      },
      {
        name: 'Jigawa',
        localGovernments: ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi']
      },
      {
        name: 'Kaduna',
        localGovernments: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria']
      },
      {
        name: 'Kano',
        localGovernments: ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil']
      },
      {
        name: 'Katsina',
        localGovernments: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango']
      },
      {
        name: 'Kebbi',
        localGovernments: ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru']
      },
      {
        name: 'Kogi',
        localGovernments: ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West']
      },
      {
        name: 'Kwara',
        localGovernments: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi']
      },
      {
        name: 'Lagos',
        localGovernments: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere']
      },
      {
        name: 'Nasarawa',
        localGovernments: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba']
      },
      {
        name: 'Niger',
        localGovernments: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi']
      },
      {
        name: 'Ogun',
        localGovernments: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu']
      },
      {
        name: 'Ondo',
        localGovernments: ['Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo']
      },
      {
        name: 'Osun',
        localGovernments: ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Egbedore', 'Ejigbo', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo']
      },
      {
        name: 'Oyo',
        localGovernments: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere']
      },
      {
        name: 'Plateau',
        localGovernments: ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang South', 'Langtang North', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase']
      },
      {
        name: 'Rivers',
        localGovernments: ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai']
      },
      {
        name: 'Sokoto',
        localGovernments: ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo']
      },
      {
        name: 'Taraba',
        localGovernments: ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing']
      },
      {
        name: 'Yobe',
        localGovernments: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari']
      },
      {
        name: 'Zamfara',
        localGovernments: ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi']
      },
      {
        name: 'FCT',
        localGovernments: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council']
      }
    ]
  },
  {
    name: 'North Korea',
    code: 'KP',
    states: [
      { name: 'Pyongyang', localGovernments: ['Pyongyang City', 'Moranbong', 'Potonggang'] },
      { name: 'South Pyongan', localGovernments: ['Pyongsong', 'Anju', 'Tokchon'] }
    ]
  },
  {
    name: 'North Macedonia',
    code: 'MK',
    states: [
      { name: 'Skopje', localGovernments: ['Skopje City', 'Čair', 'Karpoš'] },
      { name: 'Pelagonia', localGovernments: ['Bitola', 'Prilep', 'Resen'] }
    ]
  },
  {
    name: 'Norway',
    code: 'NO',
    states: [
      { name: 'Oslo', localGovernments: ['Oslo Municipality'] },
      { name: 'Viken', localGovernments: ['Drammen', 'Fredrikstad', 'Sarpsborg'] }
    ]
  },
  {
    name: 'Oman',
    code: 'OM',
    states: [
      { name: 'Muscat', localGovernments: ['Muscat City', 'Muttrah', 'Bawshar'] },
      { name: 'Dhofar', localGovernments: ['Salalah', 'Taqah', 'Mirbat'] }
    ]
  },
  {
    name: 'Pakistan',
    code: 'PK',
    states: [
      { name: 'Punjab', localGovernments: ['Lahore', 'Faisalabad', 'Rawalpindi'] },
      { name: 'Sindh', localGovernments: ['Karachi', 'Hyderabad', 'Sukkur'] }
    ]
  },
  {
    name: 'Palau',
    code: 'PW',
    states: [
      { name: 'Koror', localGovernments: ['Koror City'] },
      { name: 'Airai', localGovernments: ['Ngerulmud'] }
    ]
  },
  {
    name: 'Panama',
    code: 'PA',
    states: [
      { name: 'Panamá', localGovernments: ['Panama City', 'San Miguelito', 'Tocumen'] },
      { name: 'Colón', localGovernments: ['Colón City', 'Portobelo'] }
    ]
  },
  {
    name: 'Papua New Guinea',
    code: 'PG',
    states: [
      { name: 'National Capital District', localGovernments: ['Port Moresby'] },
      { name: 'Morobe', localGovernments: ['Lae', 'Bulolo'] }
    ]
  },
  {
    name: 'Paraguay',
    code: 'PY',
    states: [
      { name: 'Central', localGovernments: ['Asunción', 'Luque', 'San Lorenzo'] },
      { name: 'Alto Paraná', localGovernments: ['Ciudad del Este', 'Presidente Franco'] }
    ]
  },
  {
    name: 'Peru',
    code: 'PE',
    states: [
      { name: 'Lima', localGovernments: ['Lima City', 'Callao', 'San Juan de Lurigancho'] },
      { name: 'Arequipa', localGovernments: ['Arequipa City', 'Cayma', 'Cerro Colorado'] }
    ]
  },
  {
    name: 'Philippines',
    code: 'PH',
    states: [
      { name: 'Metro Manila', localGovernments: ['Manila', 'Quezon City', 'Makati', 'Pasig'] },
      { name: 'Cebu', localGovernments: ['Cebu City', 'Mandaue', 'Lapu-Lapu'] }
    ]
  },
  {
    name: 'Poland',
    code: 'PL',
    states: [
      { name: 'Masovian', localGovernments: ['Warsaw', 'Radom', 'Płock'] },
      { name: 'Lesser Poland', localGovernments: ['Kraków', 'Tarnów', 'Nowy Sącz'] }
    ]
  },
  {
    name: 'Portugal',
    code: 'PT',
    states: [
      { name: 'Lisbon', localGovernments: ['Lisbon City', 'Sintra', 'Cascais'] },
      { name: 'Porto', localGovernments: ['Porto City', 'Vila Nova de Gaia', 'Matosinhos'] }
    ]
  },
  {
    name: 'Qatar',
    code: 'QA',
    states: [
      { name: 'Doha', localGovernments: ['Doha City', 'Al Rayyan', 'Al Wakrah'] },
      { name: 'Al Khor', localGovernments: ['Al Khor City', 'Al Thakhira'] }
    ]
  },
  {
    name: 'Romania',
    code: 'RO',
    states: [
      { name: 'Bucharest', localGovernments: ['Sector 1', 'Sector 2', 'Sector 3'] },
      { name: 'Cluj', localGovernments: ['Cluj-Napoca', 'Turda', 'Dej'] }
    ]
  },
  {
    name: 'Russia',
    code: 'RU',
    states: [
      { name: 'Moscow', localGovernments: ['Central District', 'Northern District', 'Southern District'] },
      { name: 'Saint Petersburg', localGovernments: ['Admiralteysky', 'Vasileostrovsky', 'Vyborgsky'] },
      { name: 'Moscow Oblast', localGovernments: ['Balashikha', 'Khimki', 'Podolsk'] }
    ]
  },
  {
    name: 'Rwanda',
    code: 'RW',
    states: [
      { name: 'Kigali', localGovernments: ['Kigali City', 'Gasabo', 'Kicukiro'] },
      { name: 'Eastern', localGovernments: ['Rwamagana', 'Kayonza', 'Kirehe'] }
    ]
  },
  {
    name: 'Saint Kitts and Nevis',
    code: 'KN',
    states: [
      { name: 'Saint George Basseterre', localGovernments: ['Basseterre'] },
      { name: 'Nevis', localGovernments: ['Charlestown'] }
    ]
  },
  {
    name: 'Saint Lucia',
    code: 'LC',
    states: [
      { name: 'Castries', localGovernments: ['Castries City'] },
      { name: 'Gros Islet', localGovernments: ['Gros Islet Town', 'Rodney Bay'] }
    ]
  },
  {
    name: 'Saint Vincent and the Grenadines',
    code: 'VC',
    states: [
      { name: 'Saint George', localGovernments: ['Kingstown'] },
      { name: 'Grenadines', localGovernments: ['Port Elizabeth', 'Bequia'] }
    ]
  },
  {
    name: 'Samoa',
    code: 'WS',
    states: [
      { name: 'Tuamasaga', localGovernments: ['Apia', 'Vaimauga', 'Faleata'] },
      { name: 'Savai\'i', localGovernments: ['Salelologa', 'Asau'] }
    ]
  },
  {
    name: 'San Marino',
    code: 'SM',
    states: [
      { name: 'San Marino', localGovernments: ['San Marino City', 'Borgo Maggiore', 'Serravalle'] }
    ]
  },
  {
    name: 'São Tomé and Príncipe',
    code: 'ST',
    states: [
      { name: 'São Tomé', localGovernments: ['São Tomé City', 'Trindade'] },
      { name: 'Príncipe', localGovernments: ['Santo António'] }
    ]
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    states: [
      { name: 'Riyadh', localGovernments: ['Riyadh City', 'Al-Kharj', 'Ad-Diriyah'] },
      { name: 'Makkah', localGovernments: ['Jeddah', 'Mecca', 'Taif'] }
    ]
  },
  {
    name: 'Senegal',
    code: 'SN',
    states: [
      { name: 'Dakar', localGovernments: ['Dakar Region', 'Pikine', 'Guédiawaye'] },
      { name: 'Thiès', localGovernments: ['Thiès City', 'Mbour', 'Tivaouane'] }
    ]
  },
  {
    name: 'Serbia',
    code: 'RS',
    states: [
      { name: 'Belgrade', localGovernments: ['Belgrade City', 'Novi Beograd', 'Zemun'] },
      { name: 'Vojvodina', localGovernments: ['Novi Sad', 'Subotica', 'Zrenjanin'] }
    ]
  },
  {
    name: 'Seychelles',
    code: 'SC',
    states: [
      { name: 'Mahé', localGovernments: ['Victoria', 'Beau Vallon', 'Anse Royale'] },
      { name: 'Praslin', localGovernments: ['Baie Sainte Anne', 'Grand Anse'] }
    ]
  },
  {
    name: 'Sierra Leone',
    code: 'SL',
    states: [
      { name: 'Western Area', localGovernments: ['Freetown', 'Waterloo'] },
      { name: 'Eastern', localGovernments: ['Kenema', 'Koidu'] }
    ]
  },
  {
    name: 'Singapore',
    code: 'SG',
    states: [
      { name: 'Central Region', localGovernments: ['Downtown Core', 'Orchard', 'Marina South'] }
    ]
  },
  {
    name: 'Slovakia',
    code: 'SK',
    states: [
      { name: 'Bratislava', localGovernments: ['Bratislava City', 'Petržalka', 'Rača'] },
      { name: 'Košice', localGovernments: ['Košice City', 'Michalovce', 'Trebišov'] }
    ]
  },
  {
    name: 'Slovenia',
    code: 'SI',
    states: [
      { name: 'Central Slovenia', localGovernments: ['Ljubljana', 'Domžale', 'Kamnik'] },
      { name: 'Coastal–Karst', localGovernments: ['Koper', 'Izola', 'Piran'] }
    ]
  },
  {
    name: 'Solomon Islands',
    code: 'SB',
    states: [
      { name: 'Guadalcanal', localGovernments: ['Honiara'] },
      { name: 'Malaita', localGovernments: ['Auki', 'Malu\'u'] }
    ]
  },
  {
    name: 'Somalia',
    code: 'SO',
    states: [
      { name: 'Banaadir', localGovernments: ['Mogadishu', 'Hodan', 'Wadajir'] },
      { name: 'Puntland', localGovernments: ['Garowe', 'Bosaso'] }
    ]
  },
  {
    name: 'South Africa',
    code: 'ZA',
    states: [
      { name: 'Gauteng', localGovernments: ['City of Johannesburg', 'City of Tshwane', 'Ekurhuleni'] },
      { name: 'Western Cape', localGovernments: ['City of Cape Town', 'Cape Winelands District'] },
      { name: 'KwaZulu-Natal', localGovernments: ['eThekwini', 'Amajuba District'] }
    ]
  },
  {
    name: 'South Korea',
    code: 'KR',
    states: [
      { name: 'Seoul', localGovernments: ['Gangnam', 'Jongno', 'Jung', 'Songpa'] },
      { name: 'Busan', localGovernments: ['Haeundae', 'Suyeong', 'Busanjin'] },
      { name: 'Incheon', localGovernments: ['Namdong', 'Bupyeong', 'Seo'] }
    ]
  },
  {
    name: 'South Sudan',
    code: 'SS',
    states: [
      { name: 'Central Equatoria', localGovernments: ['Juba', 'Yei', 'Kajo Keji'] },
      { name: 'Upper Nile', localGovernments: ['Malakal', 'Renk'] }
    ]
  },
  {
    name: 'Spain',
    code: 'ES',
    states: [
      { name: 'Madrid', localGovernments: ['Madrid City', 'Móstoles', 'Alcalá de Henares'] },
      { name: 'Catalonia', localGovernments: ['Barcelona', 'Hospitalet', 'Terrassa'] },
      { name: 'Andalusia', localGovernments: ['Seville', 'Málaga', 'Córdoba'] }
    ]
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    states: [
      { name: 'Western', localGovernments: ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa'] },
      { name: 'Central', localGovernments: ['Kandy', 'Nuwara Eliya', 'Matale'] }
    ]
  },
  {
    name: 'Sudan',
    code: 'SD',
    states: [
      { name: 'Khartoum', localGovernments: ['Khartoum State', 'Omdurman', 'Khartoum North'] },
      { name: 'Red Sea', localGovernments: ['Port Sudan', 'Suakin'] }
    ]
  },
  {
    name: 'Suriname',
    code: 'SR',
    states: [
      { name: 'Paramaribo', localGovernments: ['Paramaribo City', 'Lelydorp', 'Brokopondo'] },
      { name: 'Wanica', localGovernments: ['Houttuin', 'Koewarasan', 'Domburg'] }
    ]
  },
  {
    name: 'Swaziland',
    code: 'SZ',
    states: [
      { name: 'Hhohho', localGovernments: ['Mbabane', 'Lobamba'] },
      { name: 'Manzini', localGovernments: ['Manzini City', 'Malkerns'] }
    ]
  },
  {
    name: 'Sweden',
    code: 'SE',
    states: [
      { name: 'Stockholm', localGovernments: ['Stockholm City', 'Solna', 'Huddinge'] },
      { name: 'Västra Götaland', localGovernments: ['Gothenburg', 'Borås', 'Mölndal'] }
    ]
  },
  {
    name: 'Switzerland',
    code: 'CH',
    states: [
      { name: 'Zürich', localGovernments: ['Zürich City', 'Winterthur', 'Uster'] },
      { name: 'Geneva', localGovernments: ['Geneva City', 'Vernier', 'Lancy'] }
    ]
  },
  {
    name: 'Syria',
    code: 'SY',
    states: [
      { name: 'Damascus', localGovernments: ['Damascus City', 'Douma', 'Jaramana'] },
      { name: 'Aleppo', localGovernments: ['Aleppo City', 'Al-Bab', 'Manbij'] }
    ]
  },
  {
    name: 'Tajikistan',
    code: 'TJ',
    states: [
      { name: 'Dushanbe', localGovernments: ['Dushanbe City', 'Vahdat', 'Hisor'] },
      { name: 'Sughd', localGovernments: ['Khujand', 'Istaravshan', 'Panjakent'] }
    ]
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    states: [
      { name: 'Dar es Salaam', localGovernments: ['Ilala', 'Kinondoni', 'Temeke'] },
      { name: 'Mwanza', localGovernments: ['Ilemela', 'Nyamagana'] },
      { name: 'Arusha', localGovernments: ['Arusha City', 'Arusha District'] }
    ]
  },
  {
    name: 'Thailand',
    code: 'TH',
    states: [
      { name: 'Bangkok', localGovernments: ['Phra Nakhon', 'Dusit', 'Bang Rak'] },
      { name: 'Chiang Mai', localGovernments: ['Mueang Chiang Mai', 'Hang Dong', 'San Sai'] }
    ]
  },
  {
    name: 'Timor-Leste',
    code: 'TL',
    states: [
      { name: 'Dili', localGovernments: ['Dili City', 'Metinaro', 'Cristo Rei'] },
      { name: 'Baucau', localGovernments: ['Baucau City', 'Laga', 'Quelicai'] }
    ]
  },
  {
    name: 'Togo',
    code: 'TG',
    states: [
      { name: 'Maritime', localGovernments: ['Lomé', 'Tsévié', 'Aného'] },
      { name: 'Plateaux', localGovernments: ['Atakpamé', 'Kpalimé'] }
    ]
  },
  {
    name: 'Tonga',
    code: 'TO',
    states: [
      { name: 'Tongatapu', localGovernments: ['Nuku\'alofa', 'Mu\'a', 'Vaini'] },
      { name: 'Vava\'u', localGovernments: ['Neiafu', 'Pangaimotu'] }
    ]
  },
  {
    name: 'Trinidad and Tobago',
    code: 'TT',
    states: [
      { name: 'Port of Spain', localGovernments: ['Port of Spain City', 'San Fernando'] },
      { name: 'Tobago', localGovernments: ['Scarborough', 'Plymouth'] }
    ]
  },
  {
    name: 'Tunisia',
    code: 'TN',
    states: [
      { name: 'Tunis', localGovernments: ['Tunis Governorate', 'La Marsa', 'Carthage'] },
      { name: 'Sfax', localGovernments: ['Sfax City', 'Sakiet Ezzit'] }
    ]
  },
  {
    name: 'Turkey',
    code: 'TR',
    states: [
      { name: 'Istanbul', localGovernments: ['Fatih', 'Beyoğlu', 'Kadıköy', 'Üsküdar'] },
      { name: 'Ankara', localGovernments: ['Çankaya', 'Keçiören', 'Yenimahalle'] }
    ]
  },
  {
    name: 'Turkmenistan',
    code: 'TM',
    states: [
      { name: 'Ahal', localGovernments: ['Ashgabat', 'Anau', 'Tejen'] },
      { name: 'Lebap', localGovernments: ['Türkmenabat', 'Atamyrat', 'Sayat'] }
    ]
  },
  {
    name: 'Tuvalu',
    code: 'TV',
    states: [
      { name: 'Funafuti', localGovernments: ['Funafuti Atoll'] },
      { name: 'Nanumea', localGovernments: ['Nanumea Atoll'] }
    ]
  },
  {
    name: 'Uganda',
    code: 'UG',
    states: [
      { name: 'Central', localGovernments: ['Kampala', 'Wakiso', 'Mpigi'] },
      { name: 'Eastern', localGovernments: ['Mbale', 'Tororo', 'Jinja'] },
      { name: 'Northern', localGovernments: ['Gulu', 'Lira', 'Arua'] },
      { name: 'Western', localGovernments: ['Mbarara', 'Kasese', 'Hoima'] }
    ]
  },
  {
    name: 'Ukraine',
    code: 'UA',
    states: [
      { name: 'Kyiv', localGovernments: ['Kyiv City', 'Brovary', 'Bila Tserkva'] },
      { name: 'Kharkiv', localGovernments: ['Kharkiv City', 'Chuhuiv', 'Lozova'] }
    ]
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    states: [
      { name: 'Dubai', localGovernments: ['Dubai Municipality'] },
      { name: 'Abu Dhabi', localGovernments: ['Abu Dhabi City', 'Al Ain'] }
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    states: [
      { name: 'England', localGovernments: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool'] },
      { name: 'Scotland', localGovernments: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'] },
      { name: 'Wales', localGovernments: ['Cardiff', 'Swansea', 'Newport', 'Wrexham'] },
      { name: 'Northern Ireland', localGovernments: ['Belfast', 'Derry', 'Lisburn', 'Newry'] }
    ]
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      { name: 'Alabama', localGovernments: ['Jefferson County', 'Mobile County', 'Madison County'] },
      { name: 'Alaska', localGovernments: ['Anchorage', 'Fairbanks', 'Juneau'] },
      { name: 'Arizona', localGovernments: ['Maricopa County', 'Pima County', 'Pinal County'] },
      { name: 'Arkansas', localGovernments: ['Pulaski County', 'Benton County', 'Washington County'] },
      { name: 'California', localGovernments: ['Los Angeles County', 'San Diego County', 'Orange County'] },
      { name: 'Colorado', localGovernments: ['Denver County', 'El Paso County', 'Arapahoe County'] },
      { name: 'Connecticut', localGovernments: ['Fairfield County', 'Hartford County', 'New Haven County'] },
      { name: 'Delaware', localGovernments: ['New Castle County', 'Kent County', 'Sussex County'] },
      { name: 'Florida', localGovernments: ['Miami-Dade County', 'Broward County', 'Palm Beach County'] },
      { name: 'Georgia', localGovernments: ['Fulton County', 'Gwinnett County', 'Cobb County'] },
      { name: 'Hawaii', localGovernments: ['Honolulu County', 'Hawaii County', 'Maui County'] },
      { name: 'Idaho', localGovernments: ['Ada County', 'Canyon County', 'Kootenai County'] },
      { name: 'Illinois', localGovernments: ['Cook County', 'DuPage County', 'Lake County'] },
      { name: 'Indiana', localGovernments: ['Marion County', 'Lake County', 'Allen County'] },
      { name: 'Iowa', localGovernments: ['Polk County', 'Linn County', 'Scott County'] },
      { name: 'Kansas', localGovernments: ['Johnson County', 'Sedgwick County', 'Shawnee County'] },
      { name: 'Kentucky', localGovernments: ['Jefferson County', 'Fayette County', 'Kenton County'] },
      { name: 'Louisiana', localGovernments: ['Orleans Parish', 'Jefferson Parish', 'East Baton Rouge Parish'] },
      { name: 'Maine', localGovernments: ['Cumberland County', 'York County', 'Penobscot County'] },
      { name: 'Maryland', localGovernments: ['Montgomery County', 'Prince George\'s County', 'Baltimore County'] },
      { name: 'Massachusetts', localGovernments: ['Middlesex County', 'Worcester County', 'Essex County'] },
      { name: 'Michigan', localGovernments: ['Wayne County', 'Oakland County', 'Macomb County'] },
      { name: 'Minnesota', localGovernments: ['Hennepin County', 'Ramsey County', 'Dakota County'] },
      { name: 'Mississippi', localGovernments: ['Hinds County', 'Harrison County', 'DeSoto County'] },
      { name: 'Missouri', localGovernments: ['St. Louis County', 'Jackson County', 'St. Charles County'] },
      { name: 'Montana', localGovernments: ['Yellowstone County', 'Missoula County', 'Gallatin County'] },
      { name: 'Nebraska', localGovernments: ['Douglas County', 'Lancaster County', 'Sarpy County'] },
      { name: 'Nevada', localGovernments: ['Clark County', 'Washoe County', 'Carson City'] },
      { name: 'New Hampshire', localGovernments: ['Hillsborough County', 'Rockingham County', 'Merrimack County'] },
      { name: 'New Jersey', localGovernments: ['Bergen County', 'Essex County', 'Middlesex County'] },
      { name: 'New Mexico', localGovernments: ['Bernalillo County', 'Doña Ana County', 'Santa Fe County'] },
      { name: 'New York', localGovernments: ['New York County', 'Kings County', 'Queens County'] },
      { name: 'North Carolina', localGovernments: ['Mecklenburg County', 'Wake County', 'Guilford County'] },
      { name: 'North Dakota', localGovernments: ['Cass County', 'Burleigh County', 'Grand Forks County'] },
      { name: 'Ohio', localGovernments: ['Cuyahoga County', 'Franklin County', 'Hamilton County'] },
      { name: 'Oklahoma', localGovernments: ['Oklahoma County', 'Tulsa County', 'Cleveland County'] },
      { name: 'Oregon', localGovernments: ['Multnomah County', 'Washington County', 'Clackamas County'] },
      { name: 'Pennsylvania', localGovernments: ['Philadelphia County', 'Allegheny County', 'Montgomery County'] },
      { name: 'Rhode Island', localGovernments: ['Providence County', 'Kent County', 'Washington County'] },
      { name: 'South Carolina', localGovernments: ['Greenville County', 'Richland County', 'Charleston County'] },
      { name: 'South Dakota', localGovernments: ['Minnehaha County', 'Pennington County', 'Lincoln County'] },
      { name: 'Tennessee', localGovernments: ['Shelby County', 'Davidson County', 'Knox County'] },
      { name: 'Texas', localGovernments: ['Harris County', 'Dallas County', 'Tarrant County'] },
      { name: 'Utah', localGovernments: ['Salt Lake County', 'Utah County', 'Davis County'] },
      { name: 'Vermont', localGovernments: ['Chittenden County', 'Rutland County', 'Washington County'] },
      { name: 'Virginia', localGovernments: ['Fairfax County', 'Virginia Beach City', 'Prince William County'] },
      { name: 'Washington', localGovernments: ['King County', 'Pierce County', 'Snohomish County'] },
      { name: 'West Virginia', localGovernments: ['Kanawha County', 'Berkeley County', 'Cabell County'] },
      { name: 'Wisconsin', localGovernments: ['Milwaukee County', 'Dane County', 'Waukesha County'] },
      { name: 'Wyoming', localGovernments: ['Laramie County', 'Natrona County', 'Campbell County'] }
    ]
  },
  {
    name: 'Uruguay',
    code: 'UY',
    states: [
      { name: 'Montevideo', localGovernments: ['Montevideo City'] },
      { name: 'Canelones', localGovernments: ['Ciudad de la Costa', 'Las Piedras', 'Pando'] }
    ]
  },
  {
    name: 'Uzbekistan',
    code: 'UZ',
    states: [
      { name: 'Tashkent', localGovernments: ['Tashkent City', 'Chirchiq', 'Angren'] },
      { name: 'Samarkand', localGovernments: ['Samarkand City', 'Kattakurgan', 'Urgut'] }
    ]
  },
  {
    name: 'Vanuatu',
    code: 'VU',
    states: [
      { name: 'Shefa', localGovernments: ['Port Vila', 'Erakor', 'Mele'] },
      { name: 'Sanma', localGovernments: ['Luganville', 'Port Olry'] }
    ]
  },
  {
    name: 'Vatican City',
    code: 'VA',
    states: [
      { name: 'Vatican City', localGovernments: ['Vatican City State'] }
    ]
  },
  {
    name: 'Venezuela',
    code: 'VE',
    states: [
      { name: 'Capital District', localGovernments: ['Caracas'] },
      { name: 'Zulia', localGovernments: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda'] }
    ]
  },
  {
    name: 'Vietnam',
    code: 'VN',
    states: [
      { name: 'Hanoi', localGovernments: ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa'] },
      { name: 'Ho Chi Minh City', localGovernments: ['District 1', 'District 3', 'Bình Thạnh'] }
    ]
  },
  {
    name: 'Yemen',
    code: 'YE',
    states: [
      { name: 'Sana\'a', localGovernments: ['Sana\'a City', 'Al Wahdah', 'Azal'] },
      { name: 'Aden', localGovernments: ['Aden City', 'Crater', 'Khormaksar'] }
    ]
  },
  {
    name: 'Zambia',
    code: 'ZM',
    states: [
      { name: 'Lusaka', localGovernments: ['Lusaka Province', 'Lusaka City', 'Kafue'] },
      { name: 'Copperbelt', localGovernments: ['Kitwe', 'Ndola', 'Mufulira'] }
    ]
  },
  {
    name: 'Zimbabwe',
    code: 'ZW',
    states: [
      { name: 'Harare', localGovernments: ['Harare Province', 'Harare City', 'Chitungwiza'] },
      { name: 'Bulawayo', localGovernments: ['Bulawayo City'] }
    ]
  }
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function getCountryByName(name: string): Country | undefined {
  return countries.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getStatesByCountry(countryCode: string): State[] {
  const country = getCountryByCode(countryCode);
  return country?.states || [];
}

export function getLocalGovernmentsByState(countryCode: string, stateName: string): string[] {
  const country = getCountryByCode(countryCode);
  const state = country?.states.find(s => s.name === stateName);
  return state?.localGovernments || [];
}