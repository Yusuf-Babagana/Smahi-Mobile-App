
import { Country } from '../types';

// Comprehensive list of countries with African countries having detailed state/LGA data
export const countries: Country[] = [
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
    name: 'Ghana',
    code: 'GH',
    states: [
      {
        name: 'Greater Accra',
        localGovernments: ['Accra Metropolitan', 'Tema Metropolitan', 'Adenta Municipal', 'Ashaiman Municipal', 'Ga Central Municipal', 'Ga East Municipal', 'Ga North Municipal', 'Ga South Municipal', 'Ga West Municipal', 'Kpone Katamanso Municipal', 'Krowor Municipal', 'La Dade Kotopon Municipal', 'La Nkwantanang Madina Municipal', 'Ledzokuku Municipal', 'Shai Osudoku District', 'Weija Gbawe Municipal']
      },
      {
        name: 'Ashanti',
        localGovernments: ['Kumasi Metropolitan', 'Adansi North District', 'Adansi South District', 'Afigya Kwabre North District', 'Afigya Kwabre South District', 'Ahafo Ano North District', 'Ahafo Ano South East District', 'Ahafo Ano South West District', 'Amansie Central District', 'Amansie South District', 'Amansie West District', 'Asante Akim Central Municipal', 'Asante Akim North District', 'Asante Akim South District', 'Asokore Mampong Municipal', 'Atwima Kwanwoma District', 'Atwima Mponua District', 'Atwima Nwabiagya Municipal', 'Atwima Nwabiagya North District', 'Bekwai Municipal', 'Bosome Freho District', 'Bosomtwe District', 'Ejisu Municipal', 'Ejura Sekyedumase Municipal', 'Juaben Municipal', 'Kwabre East Municipal', 'Mampong Municipal', 'Obuasi Municipal', 'Obuasi East District', 'Offinso Municipal', 'Offinso North District', 'Old Tafo Municipal', 'Sekyere Afram Plains District', 'Sekyere Central District', 'Sekyere East District', 'Sekyere Kumawu District', 'Sekyere South District']
      },
      {
        name: 'Western',
        localGovernments: ['Sekondi-Takoradi Metropolitan', 'Ahanta West Municipal', 'Effia-Kwesimintsim Municipal', 'Ellembelle District', 'Jomoro Municipal', 'Mpohor District', 'Nzema East Municipal', 'Prestea Huni-Valley Municipal', 'Shama District', 'Tarkwa-Nsuaem Municipal', 'Wassa Amenfi Central Municipal', 'Wassa Amenfi East Municipal', 'Wassa Amenfi West District', 'Wassa East District']
      },
      {
        name: 'Central',
        localGovernments: ['Cape Coast Metropolitan', 'Abura-Asebu-Kwamankese District', 'Agona East District', 'Agona West Municipal', 'Ajumako-Enyan-Essiam District', 'Asikuma-Odoben-Brakwa District', 'Assin Central Municipal', 'Assin North District', 'Assin South District', 'Awutu Senya District', 'Awutu Senya East Municipal', 'Effutu Municipal', 'Ekumfi District', 'Gomoa Central District', 'Gomoa East District', 'Gomoa West District', 'Komenda-Edina-Eguafo-Abirem Municipal', 'Mfantseman Municipal', 'Twifo Atti-Morkwa District', 'Twifo Hemang Lower Denkyira District', 'Upper Denkyira East Municipal', 'Upper Denkyira West District']
      },
      {
        name: 'Eastern',
        localGovernments: ['New Juaben Municipal', 'Abuakwa North Municipal', 'Abuakwa South Municipal', 'Achiase District', 'Akuapim North Municipal', 'Akuapim South District', 'Akyemansa District', 'Asene Manso Akroso District', 'Asuogyaman District', 'Atiwa East District', 'Atiwa West District', 'Ayensuano District', 'Birim Central Municipal', 'Birim North District', 'Birim South District', 'Denkyembour District', 'Fanteakwa North District', 'Fanteakwa South District', 'Kwaebibirem Municipal', 'Kwahu Afram Plains North District', 'Kwahu Afram Plains South District', 'Kwahu East District', 'Kwahu South District', 'Kwahu West Municipal', 'Lower Manya Krobo Municipal', 'Nsawam Adoagyire Municipal', 'Okere District', 'Suhum Municipal', 'Upper Manya Krobo District', 'Upper West Akim District', 'West Akim Municipal', 'Yilo Krobo Municipal']
      },
      {
        name: 'Volta',
        localGovernments: ['Ho Municipal', 'Adaklu District', 'Afadjato South District', 'Agotime Ziope District', 'Akatsi North District', 'Akatsi South Municipal', 'Central Tongu District', 'Ho West District', 'Hohoe Municipal', 'Keta Municipal', 'Ketu North Municipal', 'Ketu South Municipal', 'Kpando Municipal', 'North Dayi District', 'North Tongu District', 'South Dayi District', 'South Tongu District']
      },
      {
        name: 'Northern',
        localGovernments: ['Tamale Metropolitan', 'Bole District', 'Central Gonja District', 'East Gonja Municipal', 'Gushegu Municipal', 'Karaga District', 'Kpandai District', 'Kumbungu District', 'Mion District', 'Nanton District', 'Nanumba North Municipal', 'Nanumba South District', 'North Gonja District', 'Saboba District', 'Sagnarigu Municipal', 'Savelugu Municipal', 'Sawla-Tuna-Kalba District', 'Tatale Sanguli District', 'Tolon District', 'West Gonja Municipal', 'Yendi Municipal', 'Zabzugu District']
      },
      {
        name: 'Upper East',
        localGovernments: ['Bolgatanga Municipal', 'Bawku Municipal', 'Bawku West District', 'Binduri District', 'Bongo District', 'Builsa North District', 'Builsa South District', 'Garu District', 'Kassena Nankana Municipal', 'Kassena Nankana West District', 'Nabdam District', 'Pusiga District', 'Talensi District', 'Tempane District']
      },
      {
        name: 'Upper West',
        localGovernments: ['Wa Municipal', 'Daffiama Bussie Issa District', 'Jirapa Municipal', 'Lambussie District', 'Lawra Municipal', 'Nadowli-Kaleo District', 'Nandom Municipal', 'Sissala East Municipal', 'Sissala West District', 'Wa East District', 'Wa West District']
      },
      {
        name: 'Brong-Ahafo',
        localGovernments: ['Sunyani Municipal', 'Asunafo North Municipal', 'Asunafo South District', 'Asutifi North District', 'Asutifi South District', 'Banda District', 'Berekum Municipal', 'Dormaa Central Municipal', 'Dormaa East District', 'Dormaa West District', 'Jaman North District', 'Jaman South Municipal', 'Kintampo North Municipal', 'Kintampo South District', 'Nkoranza North District', 'Nkoranza South Municipal', 'Pru East District', 'Pru West District', 'Sene East District', 'Sene West District', 'Sunyani West District', 'Tain District', 'Tano North District', 'Tano South Municipal', 'Techiman Municipal', 'Techiman North District', 'Wenchi Municipal']
      }
    ]
  },
  {
    name: 'Kenya',
    code: 'KE',
    states: [
      {
        name: 'Nairobi',
        localGovernments: ['Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra', 'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North', 'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara', 'Kamukunji', 'Starehe', 'Mathare']
      },
      {
        name: 'Mombasa',
        localGovernments: ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni', 'Mvita']
      },
      {
        name: 'Kiambu',
        localGovernments: ['Gatundu South', 'Gatundu North', 'Juja', 'Thika Town', 'Ruiru', 'Githunguri', 'Kiambu', 'Kiambaa', 'Kabete', 'Kikuyu', 'Limuru', 'Lari']
      },
      {
        name: 'Nakuru',
        localGovernments: ['Molo', 'Njoro', 'Naivasha', 'Gilgil', 'Kuresoi South', 'Kuresoi North', 'Subukia', 'Rongai', 'Bahati', 'Nakuru Town West', 'Nakuru Town East']
      },
      {
        name: 'Kisumu',
        localGovernments: ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach']
      }
    ]
  },
  {
    name: 'South Africa',
    code: 'ZA',
    states: [
      {
        name: 'Gauteng',
        localGovernments: ['City of Johannesburg', 'City of Tshwane', 'Ekurhuleni', 'Sedibeng District', 'West Rand District']
      },
      {
        name: 'Western Cape',
        localGovernments: ['City of Cape Town', 'Cape Winelands District', 'Central Karoo District', 'Garden Route District', 'Overberg District', 'West Coast District']
      },
      {
        name: 'KwaZulu-Natal',
        localGovernments: ['eThekwini', 'Amajuba District', 'Harry Gwala District', 'iLembe District', 'King Cetshwayo District', 'Ugu District', 'uMgungundlovu District', 'uMkhanyakude District', 'uMzinyathi District', 'uThukela District', 'Zululand District']
      },
      {
        name: 'Eastern Cape',
        localGovernments: ['Buffalo City', 'Nelson Mandela Bay', 'Alfred Nzo District', 'Amathole District', 'Chris Hani District', 'Joe Gqabi District', 'OR Tambo District', 'Sarah Baartman District']
      },
      {
        name: 'Limpopo',
        localGovernments: ['Capricorn District', 'Mopani District', 'Sekhukhune District', 'Vhembe District', 'Waterberg District']
      }
    ]
  },
  {
    name: 'Egypt',
    code: 'EG',
    states: [
      {
        name: 'Cairo',
        localGovernments: ['Cairo Governorate']
      },
      {
        name: 'Alexandria',
        localGovernments: ['Alexandria Governorate']
      },
      {
        name: 'Giza',
        localGovernments: ['Giza Governorate']
      }
    ]
  },
  {
    name: 'Ethiopia',
    code: 'ET',
    states: [
      {
        name: 'Addis Ababa',
        localGovernments: ['Addis Ababa City']
      },
      {
        name: 'Oromia',
        localGovernments: ['West Arsi', 'East Shewa', 'West Shewa', 'North Shewa', 'Arsi', 'Bale', 'Borena', 'Guji', 'West Hararghe', 'East Hararghe', 'Jimma', 'Illubabor', 'East Welega', 'West Welega', 'Kelam Welega', 'Horo Gudru Welega']
      },
      {
        name: 'Amhara',
        localGovernments: ['North Gondar', 'South Gondar', 'North Wollo', 'South Wollo', 'North Shewa', 'East Gojjam', 'West Gojjam', 'Awi', 'Wag Hemra', 'Oromia']
      }
    ]
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    states: [
      {
        name: 'Dar es Salaam',
        localGovernments: ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni']
      },
      {
        name: 'Mwanza',
        localGovernments: ['Ilemela', 'Nyamagana']
      },
      {
        name: 'Arusha',
        localGovernments: ['Arusha City', 'Arusha District', 'Karatu', 'Longido', 'Monduli', 'Ngorongoro']
      }
    ]
  },
  {
    name: 'Uganda',
    code: 'UG',
    states: [
      {
        name: 'Central',
        localGovernments: ['Kampala', 'Wakiso', 'Mpigi', 'Mukono', 'Luwero', 'Nakaseke', 'Nakasongola', 'Kayunga', 'Buikwe', 'Buvuma', 'Gomba', 'Kalangala', 'Kalungu', 'Kiboga', 'Kyankwanzi', 'Lwengo', 'Lyantonde', 'Masaka', 'Mityana', 'Mubende', 'Rakai', 'Sembabule', 'Butambala']
      },
      {
        name: 'Eastern',
        localGovernments: ['Mbale', 'Tororo', 'Busia', 'Iganga', 'Jinja', 'Kamuli', 'Kapchorwa', 'Katakwi', 'Kumi', 'Mayuge', 'Pallisa', 'Sironko', 'Soroti', 'Budaka', 'Bududa', 'Bukedea', 'Bukwa', 'Butaleja', 'Kaliro', 'Manafwa', 'Namayingo', 'Namutumba', 'Ngora', 'Serere', 'Buyende', 'Kibuku', 'Kween', 'Luuka', 'Bulambuli', 'Butebo', 'Namisindwa', 'Bugiri', 'Namayingo']
      },
      {
        name: 'Northern',
        localGovernments: ['Gulu', 'Kitgum', 'Lira', 'Pader', 'Apac', 'Arua', 'Adjumani', 'Kotido', 'Moroto', 'Moyo', 'Nebbi', 'Nakapiripirit', 'Yumbe', 'Abim', 'Amolatar', 'Amuria', 'Amuru', 'Dokolo', 'Kaabong', 'Koboko', 'Maracha', 'Oyam', 'Agago', 'Alebtong', 'Amudat', 'Kole', 'Lamwo', 'Napak', 'Nwoya', 'Otuke', 'Zombo']
      },
      {
        name: 'Western',
        localGovernments: ['Bundibugyo', 'Bushenyi', 'Hoima', 'Kabale', 'Kabarole', 'Kasese', 'Kibaale', 'Kisoro', 'Masindi', 'Mbarara', 'Ntungamo', 'Rukungiri', 'Kamwenge', 'Kanungu', 'Kyenjojo', 'Ibanda', 'Isingiro', 'Kiruhura', 'Buliisa', 'Buhweju', 'Mitooma', 'Ntoroko', 'Rubirizi', 'Sheema', 'Kagadi', 'Kakumiro', 'Rubanda', 'Bunyangabu', 'Rukiga']
      }
    ]
  },
  // Add more African countries with basic structure
  {
    name: 'Algeria',
    code: 'DZ',
    states: [{ name: 'Algiers', localGovernments: ['Algiers Province'] }]
  },
  {
    name: 'Morocco',
    code: 'MA',
    states: [{ name: 'Casablanca-Settat', localGovernments: ['Casablanca', 'Settat'] }]
  },
  {
    name: 'Tunisia',
    code: 'TN',
    states: [{ name: 'Tunis', localGovernments: ['Tunis Governorate'] }]
  },
  {
    name: 'Libya',
    code: 'LY',
    states: [{ name: 'Tripoli', localGovernments: ['Tripoli District'] }]
  },
  {
    name: 'Sudan',
    code: 'SD',
    states: [{ name: 'Khartoum', localGovernments: ['Khartoum State'] }]
  },
  {
    name: 'Senegal',
    code: 'SN',
    states: [{ name: 'Dakar', localGovernments: ['Dakar Region'] }]
  },
  {
    name: 'Ivory Coast',
    code: 'CI',
    states: [{ name: 'Abidjan', localGovernments: ['Abidjan Autonomous District'] }]
  },
  {
    name: 'Cameroon',
    code: 'CM',
    states: [{ name: 'Centre', localGovernments: ['Yaoundé'] }]
  },
  {
    name: 'Zimbabwe',
    code: 'ZW',
    states: [{ name: 'Harare', localGovernments: ['Harare Province'] }]
  },
  {
    name: 'Zambia',
    code: 'ZM',
    states: [{ name: 'Lusaka', localGovernments: ['Lusaka Province'] }]
  },
  {
    name: 'Mozambique',
    code: 'MZ',
    states: [{ name: 'Maputo', localGovernments: ['Maputo City'] }]
  },
  {
    name: 'Angola',
    code: 'AO',
    states: [{ name: 'Luanda', localGovernments: ['Luanda Province'] }]
  },
  {
    name: 'Rwanda',
    code: 'RW',
    states: [{ name: 'Kigali', localGovernments: ['Kigali City'] }]
  },
  {
    name: 'Botswana',
    code: 'BW',
    states: [{ name: 'Gaborone', localGovernments: ['South-East District'] }]
  },
  {
    name: 'Namibia',
    code: 'NA',
    states: [{ name: 'Khomas', localGovernments: ['Windhoek'] }]
  },
  {
    name: 'Mali',
    code: 'ML',
    states: [{ name: 'Bamako', localGovernments: ['Bamako Capital District'] }]
  },
  {
    name: 'Burkina Faso',
    code: 'BF',
    states: [{ name: 'Centre', localGovernments: ['Ouagadougou'] }]
  },
  {
    name: 'Niger',
    code: 'NE',
    states: [{ name: 'Niamey', localGovernments: ['Niamey Urban Community'] }]
  },
  {
    name: 'Chad',
    code: 'TD',
    states: [{ name: 'N\'Djamena', localGovernments: ['N\'Djamena'] }]
  },
  {
    name: 'Somalia',
    code: 'SO',
    states: [{ name: 'Banaadir', localGovernments: ['Mogadishu'] }]
  },
  {
    name: 'Madagascar',
    code: 'MG',
    states: [{ name: 'Analamanga', localGovernments: ['Antananarivo'] }]
  },
  {
    name: 'Malawi',
    code: 'MW',
    states: [{ name: 'Lilongwe', localGovernments: ['Lilongwe District'] }]
  },
  {
    name: 'Benin',
    code: 'BJ',
    states: [{ name: 'Littoral', localGovernments: ['Cotonou'] }]
  },
  {
    name: 'Togo',
    code: 'TG',
    states: [{ name: 'Maritime', localGovernments: ['Lomé'] }]
  },
  {
    name: 'Sierra Leone',
    code: 'SL',
    states: [{ name: 'Western Area', localGovernments: ['Freetown'] }]
  },
  {
    name: 'Liberia',
    code: 'LR',
    states: [{ name: 'Montserrado', localGovernments: ['Monrovia'] }]
  },
  {
    name: 'Mauritius',
    code: 'MU',
    states: [{ name: 'Port Louis', localGovernments: ['Port Louis District'] }]
  },
  {
    name: 'Gabon',
    code: 'GA',
    states: [{ name: 'Estuaire', localGovernments: ['Libreville'] }]
  },
  {
    name: 'Guinea',
    code: 'GN',
    states: [{ name: 'Conakry', localGovernments: ['Conakry Special Zone'] }]
  },
  {
    name: 'Eritrea',
    code: 'ER',
    states: [{ name: 'Maekel', localGovernments: ['Asmara'] }]
  },
  {
    name: 'Burundi',
    code: 'BI',
    states: [{ name: 'Bujumbura Mairie', localGovernments: ['Bujumbura'] }]
  },
  {
    name: 'Lesotho',
    code: 'LS',
    states: [{ name: 'Maseru', localGovernments: ['Maseru District'] }]
  },
  {
    name: 'Equatorial Guinea',
    code: 'GQ',
    states: [{ name: 'Bioko Norte', localGovernments: ['Malabo'] }]
  },
  {
    name: 'Djibouti',
    code: 'DJ',
    states: [{ name: 'Djibouti', localGovernments: ['Djibouti City'] }]
  },
  {
    name: 'Swaziland',
    code: 'SZ',
    states: [{ name: 'Hhohho', localGovernments: ['Mbabane'] }]
  },
  {
    name: 'Gambia',
    code: 'GM',
    states: [{ name: 'Banjul', localGovernments: ['Banjul City'] }]
  },
  {
    name: 'Cape Verde',
    code: 'CV',
    states: [{ name: 'Praia', localGovernments: ['Praia Municipality'] }]
  },
  {
    name: 'Comoros',
    code: 'KM',
    states: [{ name: 'Grande Comore', localGovernments: ['Moroni'] }]
  },
  {
    name: 'Seychelles',
    code: 'SC',
    states: [{ name: 'Mahé', localGovernments: ['Victoria'] }]
  },
  {
    name: 'São Tomé and Príncipe',
    code: 'ST',
    states: [{ name: 'São Tomé', localGovernments: ['São Tomé'] }]
  },
  // Now add all other countries worldwide (simplified with basic structure)
  {
    name: 'United States',
    code: 'US',
    states: [
      { name: 'Alabama', localGovernments: ['Jefferson County', 'Mobile County', 'Madison County'] },
      { name: 'Alaska', localGovernments: ['Anchorage', 'Fairbanks', 'Juneau'] },
      { name: 'Arizona', localGovernments: ['Maricopa County', 'Pima County', 'Pinal County'] },
      { name: 'Arkansas', localGovernments: ['Pulaski County', 'Benton County', 'Washington County'] },
      { name: 'California', localGovernments: ['Los Angeles County', 'San Diego County', 'Orange County', 'Riverside County', 'San Bernardino County'] },
      { name: 'Colorado', localGovernments: ['Denver County', 'El Paso County', 'Arapahoe County'] },
      { name: 'Connecticut', localGovernments: ['Fairfield County', 'Hartford County', 'New Haven County'] },
      { name: 'Delaware', localGovernments: ['New Castle County', 'Kent County', 'Sussex County'] },
      { name: 'Florida', localGovernments: ['Miami-Dade County', 'Broward County', 'Palm Beach County', 'Hillsborough County'] },
      { name: 'Georgia', localGovernments: ['Fulton County', 'Gwinnett County', 'Cobb County', 'DeKalb County'] },
      { name: 'Hawaii', localGovernments: ['Honolulu County', 'Hawaii County', 'Maui County'] },
      { name: 'Idaho', localGovernments: ['Ada County', 'Canyon County', 'Kootenai County'] },
      { name: 'Illinois', localGovernments: ['Cook County', 'DuPage County', 'Lake County', 'Will County'] },
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
      { name: 'New York', localGovernments: ['New York County', 'Kings County', 'Queens County', 'Bronx County'] },
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
      { name: 'Texas', localGovernments: ['Harris County', 'Dallas County', 'Tarrant County', 'Bexar County', 'Travis County'] },
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
    name: 'Japan',
    code: 'JP',
    states: [
      { name: 'Tokyo', localGovernments: ['Chiyoda', 'Chuo', 'Minato', 'Shinjuku', 'Shibuya'] },
      { name: 'Osaka', localGovernments: ['Osaka City', 'Sakai', 'Higashiosaka'] },
      { name: 'Kyoto', localGovernments: ['Kyoto City', 'Uji', 'Kameoka'] }
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
    name: 'France',
    code: 'FR',
    states: [
      { name: 'Île-de-France', localGovernments: ['Paris', 'Versailles', 'Nanterre'] },
      { name: 'Provence-Alpes-Côte d\'Azur', localGovernments: ['Marseille', 'Nice', 'Toulon'] },
      { name: 'Auvergne-Rhône-Alpes', localGovernments: ['Lyon', 'Grenoble', 'Saint-Étienne'] }
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
    name: 'Spain',
    code: 'ES',
    states: [
      { name: 'Madrid', localGovernments: ['Madrid City', 'Móstoles', 'Alcalá de Henares'] },
      { name: 'Catalonia', localGovernments: ['Barcelona', 'Hospitalet', 'Terrassa'] },
      { name: 'Andalusia', localGovernments: ['Seville', 'Málaga', 'Córdoba'] }
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
    name: 'Mexico',
    code: 'MX',
    states: [
      { name: 'Mexico City', localGovernments: ['Cuauhtémoc', 'Iztapalapa', 'Gustavo A. Madero'] },
      { name: 'Jalisco', localGovernments: ['Guadalajara', 'Zapopan', 'Tlaquepaque'] },
      { name: 'Nuevo León', localGovernments: ['Monterrey', 'Guadalupe', 'San Nicolás'] }
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
    name: 'Russia',
    code: 'RU',
    states: [
      { name: 'Moscow', localGovernments: ['Central District', 'Northern District', 'Southern District'] },
      { name: 'Saint Petersburg', localGovernments: ['Admiralteysky', 'Vasileostrovsky', 'Vyborgsky'] },
      { name: 'Moscow Oblast', localGovernments: ['Balashikha', 'Khimki', 'Podolsk'] }
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
    name: 'Indonesia',
    code: 'ID',
    states: [
      { name: 'Jakarta', localGovernments: ['Central Jakarta', 'South Jakarta', 'East Jakarta'] },
      { name: 'West Java', localGovernments: ['Bandung', 'Bekasi', 'Depok'] },
      { name: 'East Java', localGovernments: ['Surabaya', 'Malang', 'Sidoarjo'] }
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
    name: 'Philippines',
    code: 'PH',
    states: [
      { name: 'Metro Manila', localGovernments: ['Manila', 'Quezon City', 'Makati', 'Pasig'] },
      { name: 'Cebu', localGovernments: ['Cebu City', 'Mandaue', 'Lapu-Lapu'] }
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
    name: 'Malaysia',
    code: 'MY',
    states: [
      { name: 'Kuala Lumpur', localGovernments: ['Bukit Bintang', 'Cheras', 'Kepong'] },
      { name: 'Selangor', localGovernments: ['Petaling Jaya', 'Shah Alam', 'Subang Jaya'] }
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
    name: 'Pakistan',
    code: 'PK',
    states: [
      { name: 'Punjab', localGovernments: ['Lahore', 'Faisalabad', 'Rawalpindi'] },
      { name: 'Sindh', localGovernments: ['Karachi', 'Hyderabad', 'Sukkur'] }
    ]
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    states: [
      { name: 'Dhaka', localGovernments: ['Dhaka City', 'Gazipur', 'Narayanganj'] },
      { name: 'Chittagong', localGovernments: ['Chittagong City', 'Cox\'s Bazar'] }
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
    name: 'Saudi Arabia',
    code: 'SA',
    states: [
      { name: 'Riyadh', localGovernments: ['Riyadh City', 'Al-Kharj', 'Ad-Diriyah'] },
      { name: 'Makkah', localGovernments: ['Jeddah', 'Mecca', 'Taif'] }
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
    name: 'Israel',
    code: 'IL',
    states: [
      { name: 'Tel Aviv', localGovernments: ['Tel Aviv-Yafo'] },
      { name: 'Jerusalem', localGovernments: ['Jerusalem Municipality'] }
    ]
  },
  {
    name: 'Iran',
    code: 'IR',
    states: [
      { name: 'Tehran', localGovernments: ['Tehran City', 'Rey', 'Shemiranat'] }
    ]
  },
  {
    name: 'Iraq',
    code: 'IQ',
    states: [
      { name: 'Baghdad', localGovernments: ['Baghdad City'] },
      { name: 'Basra', localGovernments: ['Basra City'] }
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
    name: 'Netherlands',
    code: 'NL',
    states: [
      { name: 'North Holland', localGovernments: ['Amsterdam', 'Haarlem', 'Zaanstad'] },
      { name: 'South Holland', localGovernments: ['Rotterdam', 'The Hague', 'Leiden'] }
    ]
  },
  {
    name: 'Belgium',
    code: 'BE',
    states: [
      { name: 'Brussels', localGovernments: ['Brussels City', 'Schaerbeek', 'Anderlecht'] },
      { name: 'Antwerp', localGovernments: ['Antwerp City', 'Mechelen'] }
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
    name: 'Norway',
    code: 'NO',
    states: [
      { name: 'Oslo', localGovernments: ['Oslo Municipality'] },
      { name: 'Viken', localGovernments: ['Drammen', 'Fredrikstad', 'Sarpsborg'] }
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
    name: 'Finland',
    code: 'FI',
    states: [
      { name: 'Uusimaa', localGovernments: ['Helsinki', 'Espoo', 'Vantaa'] },
      { name: 'Pirkanmaa', localGovernments: ['Tampere', 'Nokia', 'Ylöjärvi'] }
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
    name: 'Austria',
    code: 'AT',
    states: [
      { name: 'Vienna', localGovernments: ['Innere Stadt', 'Leopoldstadt', 'Landstraße'] },
      { name: 'Tyrol', localGovernments: ['Innsbruck', 'Kufstein', 'Schwaz'] }
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
    name: 'Greece',
    code: 'GR',
    states: [
      { name: 'Attica', localGovernments: ['Athens', 'Piraeus', 'Peristeri'] },
      { name: 'Central Macedonia', localGovernments: ['Thessaloniki', 'Katerini', 'Serres'] }
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
    name: 'Romania',
    code: 'RO',
    states: [
      { name: 'Bucharest', localGovernments: ['Sector 1', 'Sector 2', 'Sector 3'] },
      { name: 'Cluj', localGovernments: ['Cluj-Napoca', 'Turda', 'Dej'] }
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
    name: 'Ukraine',
    code: 'UA',
    states: [
      { name: 'Kyiv', localGovernments: ['Kyiv City', 'Brovary', 'Bila Tserkva'] },
      { name: 'Kharkiv', localGovernments: ['Kharkiv City', 'Chuhuiv', 'Lozova'] }
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
    name: 'Colombia',
    code: 'CO',
    states: [
      { name: 'Bogotá', localGovernments: ['Bogotá D.C.'] },
      { name: 'Antioquia', localGovernments: ['Medellín', 'Bello', 'Itagüí'] }
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
    name: 'Venezuela',
    code: 'VE',
    states: [
      { name: 'Capital District', localGovernments: ['Caracas'] },
      { name: 'Zulia', localGovernments: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda'] }
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
    name: 'Bolivia',
    code: 'BO',
    states: [
      { name: 'La Paz', localGovernments: ['La Paz City', 'El Alto', 'Viacha'] },
      { name: 'Santa Cruz', localGovernments: ['Santa Cruz de la Sierra', 'Montero', 'Warnes'] }
    ]
  },
  {
    name: 'Paraguay',
    code: 'PY',
    states: [
      { name: 'Central', localGovernments: ['Asunción', 'Luque', 'San Lorenzo'] }
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
    name: 'Costa Rica',
    code: 'CR',
    states: [
      { name: 'San José', localGovernments: ['San José City', 'Desamparados', 'Goicoechea'] }
    ]
  },
  {
    name: 'Panama',
    code: 'PA',
    states: [
      { name: 'Panamá', localGovernments: ['Panama City', 'San Miguelito', 'Tocumen'] }
    ]
  },
  {
    name: 'Guatemala',
    code: 'GT',
    states: [
      { name: 'Guatemala', localGovernments: ['Guatemala City', 'Mixco', 'Villa Nueva'] }
    ]
  },
  {
    name: 'Honduras',
    code: 'HN',
    states: [
      { name: 'Francisco Morazán', localGovernments: ['Tegucigalpa', 'Comayagüela'] }
    ]
  },
  {
    name: 'El Salvador',
    code: 'SV',
    states: [
      { name: 'San Salvador', localGovernments: ['San Salvador City', 'Soyapango', 'Santa Tecla'] }
    ]
  },
  {
    name: 'Nicaragua',
    code: 'NI',
    states: [
      { name: 'Managua', localGovernments: ['Managua City', 'Tipitapa', 'Ciudad Sandino'] }
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
    name: 'Cuba',
    code: 'CU',
    states: [
      { name: 'Havana', localGovernments: ['Havana City'] }
    ]
  },
  {
    name: 'Jamaica',
    code: 'JM',
    states: [
      { name: 'Kingston', localGovernments: ['Kingston City', 'St. Andrew'] }
    ]
  },
  {
    name: 'Trinidad and Tobago',
    code: 'TT',
    states: [
      { name: 'Port of Spain', localGovernments: ['Port of Spain City'] }
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
    name: 'Papua New Guinea',
    code: 'PG',
    states: [
      { name: 'National Capital District', localGovernments: ['Port Moresby'] }
    ]
  },
  {
    name: 'Fiji',
    code: 'FJ',
    states: [
      { name: 'Central', localGovernments: ['Suva', 'Nasinu', 'Nausori'] }
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
