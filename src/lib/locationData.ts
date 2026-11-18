/**
 * Comprehensive dataset of Continents, Countries and States/Provinces
 * Works completely offline with instant zero-latency search across all continents.
 */

export interface CountryInfo {
  name: string;
  code: string;
  states: string[];
}

export const CONTINENTS_DATA: Record<string, CountryInfo[]> = {
  Africa: [
    {
      name: "Nigeria",
      code: "NG",
      states: [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
        "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
        "Federal Capital Territory (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna",
        "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
        "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
        "Sokoto", "Taraba", "Yobe", "Zamfara"
      ],
    },
    {
      name: "Ghana",
      code: "GH",
      states: [
        "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta",
        "Northern", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
        "Oti", "Savannah", "North East", "Western North"
      ],
    },
    {
      name: "Kenya",
      code: "KE",
      states: [
        "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu",
        "Machakos", "Meru", "Kilifi", "Kakamega", "Nyeri", "Kajiado"
      ],
    },
    {
      name: "South Africa",
      code: "ZA",
      states: [
        "Gauteng (Johannesburg/Pretoria)", "Western Cape (Cape Town)", "KwaZulu-Natal (Durban)",
        "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
      ],
    },
    {
      name: "Cameroon",
      code: "CM",
      states: [
        "Centre (Yaoundé)", "Littoral (Douala)", "North-West (Bamenda)",
        "South-West (Buea)", "West (Bafoussam)", "Far North", "North", "Adamawa"
      ],
    },
    {
      name: "South Sudan",
      code: "SS",
      states: ["Central Equatoria (Juba)", "Eastern Equatoria", "Western Equatoria", "Jonglei", "Unity", "Upper Nile"],
    },
    {
      name: "Uganda",
      code: "UG",
      states: ["Central (Kampala)", "Eastern (Jinja)", "Northern (Gulu)", "Western (Mbarara)"],
    },
    {
      name: "Tanzania",
      code: "TZ",
      states: ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Kilimanjaro", "Mbeya"],
    },
    {
      name: "Cote d'Ivoire",
      code: "CI",
      states: ["Abidjan", "Yamoussoukro", "Bouake", "San-Pedro", "Daloa", "Korhogo"],
    },
    {
      name: "Benin",
      code: "BJ",
      states: ["Littoral (Cotonou)", "Oueme (Porto-Novo)", "Atlantique", "Borgou (Parakou)", "Zou", "Alibori"],
    },
    {
      name: "Togo",
      code: "TG",
      states: ["Maritime (Lome)", "Plateaux", "Centrale", "Kara", "Savanes"],
    },
    {
      name: "Liberia",
      code: "LR",
      states: ["Montserrado (Monrovia)", "Nimba", "Bong", "Grand Bassa", "Margibi", "Maryland"],
    },
    {
      name: "Sierra Leone",
      code: "SL",
      states: ["Western Area (Freetown)", "Northern Province", "Southern Province", "Eastern Province"],
    },
    {
      name: "Rwanda",
      code: "RW",
      states: ["Kigali", "Eastern Province", "Northern Province", "Southern Province", "Western Province"],
    },
    {
      name: "Zambia",
      code: "ZM",
      states: ["Lusaka", "Copperbelt (Ndola/Kitwe)", "Central", "Southern (Livingstone)", "Eastern", "North-Western"],
    },
    {
      name: "Zimbabwe",
      code: "ZW",
      states: ["Harare", "Bulawayo", "Manicaland", "Midlands", "Mashonaland East", "Masvingo"],
    },
    {
      name: "Ethiopia",
      code: "ET",
      states: ["Addis Ababa", "Oromia", "Amhara", "Sidama", "Tigray", "Somali", "Dire Dawa"],
    },
    {
      name: "Egypt",
      code: "EG",
      states: ["Cairo", "Alexandria", "Giza", "Port Said", "Suez", "Luxor", "Aswan"],
    },
    {
      name: "DR Congo",
      code: "CD",
      states: ["Kinshasa", "Haut-Katanga (Lubumbashi)", "North Kivu (Goma)", "South Kivu (Bukavu)", "Kongo Central"],
    },
    {
      name: "Angola",
      code: "AO",
      states: ["Luanda", "Benguela", "Huila (Lubango)", "Cabinda", "Huambo"],
    },
    {
      name: "Mozambique",
      code: "MZ",
      states: ["Maputo", "Sofala (Beira)", "Nampula", "Zambezia", "Cabo Delgado"],
    },
    {
      name: "Malawi",
      code: "MW",
      states: ["Lilongwe", "Blantyre", "Mzuzu", "Zomba"],
    },
    {
      name: "Senegal",
      code: "SN",
      states: ["Dakar", "Thies", "Saint-Louis", "Ziguinchor", "Kaolack"],
    },
    {
      name: "Mali",
      code: "ML",
      states: ["Bamako", "Sikasso", "Segou", "Mopti", "Kayes"],
    },
    {
      name: "Burkina Faso",
      code: "BF",
      states: ["Ouagadougou", "Bobo-Dioulasso", "Kadiogo", "Hauts-Bassins"],
    },
    {
      name: "Niger",
      code: "NE",
      states: ["Niamey", "Maradi", "Zinder", "Tahoua", "Agadez"],
    },
    {
      name: "Chad",
      code: "TD",
      states: ["N'Djamena", "Logone Occidental (Moundou)", "Chari-Baguirmi", "Mayo-Kebbi"],
    },
    {
      name: "Guinea",
      code: "GN",
      states: ["Conakry", "Kindia", "Boke", "Kankan", "Nzerekore"],
    },
    {
      name: "Gabon",
      code: "GA",
      states: ["Estuaire (Libreville)", "Haut-Ogooue (Franceville)", "Ogooue-Maritime (Port-Gentil)"],
    },
    {
      name: "Botswana",
      code: "BW",
      states: ["Gaborone", "Francistown", "Kweneng", "North-West (Maun)"],
    },
    {
      name: "Namibia",
      code: "NA",
      states: ["Khomas (Windhoek)", "Erongo (Walvis Bay/Swakopmund)", "Oshana", "Otjozondjupa"],
    },
    {
      name: "Gambia",
      code: "GM",
      states: ["Banjul", "Kanifing", "West Coast", "North Bank", "Central River"],
    },
  ],
  Europe: [
    {
      name: "United Kingdom",
      code: "GB",
      states: [
        "Greater London", "West Midlands (Birmingham)", "Greater Manchester",
        "West Yorkshire (Leeds)", "Scotland (Edinburgh/Glasgow)", "Wales (Cardiff)",
        "Northern Ireland (Belfast)", "Essex", "Kent", "Lancashire", "Hampshire"
      ],
    },
    {
      name: "Germany",
      code: "DE",
      states: [
        "Berlin", "Bavaria (Munich)", "North Rhine-Westphalia (Cologne)",
        "Baden-Württemberg (Stuttgart)", "Hesse (Frankfurt)", "Hamburg", "Lower Saxony", "Saxony"
      ],
    },
    {
      name: "France",
      code: "FR",
      states: [
        "Île-de-France (Paris)", "Auvergne-Rhône-Alpes (Lyon)",
        "Provence-Alpes-Côte d'Azur (Marseille)", "Nouvelle-Aquitaine (Bordeaux)",
        "Occitanie (Toulouse)", "Hauts-de-France (Lille)", "Grand Est (Strasbourg)"
      ],
    },
    {
      name: "Italy",
      code: "IT",
      states: ["Lombardy (Milan)", "Lazio (Rome)", "Campania (Naples)", "Veneto (Venice)", "Piedmont (Turin)", "Sicily (Palermo)"],
    },
    {
      name: "Spain",
      code: "ES",
      states: ["Community of Madrid", "Catalonia (Barcelona)", "Andalusia (Seville)", "Valencian Community", "Galicia", "Basque Country"],
    },
    {
      name: "Netherlands",
      code: "NL",
      states: ["North Holland (Amsterdam)", "South Holland (Rotterdam/The Hague)", "Utrecht", "North Brabant (Eindhoven)", "Gelderland"],
    },
    {
      name: "Belgium",
      code: "BE",
      states: ["Brussels-Capital", "Flanders (Antwerp)", "Wallonia (Liège)", "East Flanders (Ghent)"],
    },
    {
      name: "Switzerland",
      code: "CH",
      states: ["Zurich", "Geneva", "Bern", "Vaud (Lausanne)", "Basel-Stadt", "Lucerne"],
    },
    {
      name: "Ireland",
      code: "IE",
      states: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
    },
    {
      name: "Sweden",
      code: "SE",
      states: ["Stockholm", "Västra Götaland (Gothenburg)", "Skåne (Malmö)", "Uppsala"],
    },
    {
      name: "Norway",
      code: "NO",
      states: ["Oslo", "Vestland (Bergen)", "Rogaland (Stavanger)", "Trøndelag (Trondheim)"],
    },
    {
      name: "Denmark",
      code: "DK",
      states: ["Capital Region (Copenhagen)", "Central Denmark (Aarhus)", "Southern Denmark (Odense)"],
    },
    {
      name: "Finland",
      code: "FI",
      states: ["Uusimaa (Helsinki)", "Pirkanmaa (Tampere)", "Southwest Finland (Turku)"],
    },
    {
      name: "Poland",
      code: "PL",
      states: ["Masovian (Warsaw)", "Lesser Poland (Kraków)", "Lower Silesia (Wrocław)", "Greater Poland (Poznań)"],
    },
    {
      name: "Austria",
      code: "AT",
      states: ["Vienna", "Lower Austria", "Upper Austria (Linz)", "Styria (Graz)", "Salzburg", "Tyrol (Innsbruck)"],
    },
    {
      name: "Portugal",
      code: "PT",
      states: ["Lisbon", "Porto", "Braga", "Setúbal", "Faro (Algarve)", "Coimbra"],
    },
    {
      name: "Greece",
      code: "GR",
      states: ["Attica (Athens)", "Central Macedonia (Thessaloniki)", "Crete (Heraklion)", "Western Greece (Patras)"],
    },
    {
      name: "Romania",
      code: "RO",
      states: ["Bucharest", "Cluj", "Timiș", "Iași", "Constanța", "Brașov"],
    },
    {
      name: "Czech Republic",
      code: "CZ",
      states: ["Prague", "South Moravian (Brno)", "Moravian-Silesian (Ostrava)", "Plzeň"],
    },
    {
      name: "Hungary",
      code: "HU",
      states: ["Budapest", "Pest", "Hajdú-Bihar (Debrecen)", "Csongrád (Szeged)"],
    },
    {
      name: "Turkey",
      code: "TR",
      states: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana"],
    },
    {
      name: "Ukraine",
      code: "UA",
      states: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro"],
    },
  ],
  "North America": [
    {
      name: "United States",
      code: "US",
      states: [
        "Texas", "California", "New York", "Florida", "Georgia", "Maryland",
        "Illinois", "Pennsylvania", "Ohio", "North Carolina", "Michigan",
        "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts",
        "Indiana", "Tennessee", "Missouri", "Minnesota", "Alabama", "Colorado",
        "Connecticut", "Louisiana", "Kentucky", "Oklahoma", "South Carolina"
      ],
    },
    {
      name: "Canada",
      code: "CA",
      states: [
        "Ontario (Toronto/Ottawa)", "Quebec (Montreal)", "British Columbia (Vancouver)",
        "Alberta (Calgary/Edmonton)", "Manitoba (Winnipeg)", "Saskatchewan (Regina/Saskatoon)", "Nova Scotia (Halifax)"
      ],
    },
    {
      name: "Mexico",
      code: "MX",
      states: ["Mexico City", "Jalisco (Guadalajara)", "Nuevo León (Monterrey)", "Puebla", "Yucatan (Merida)", "Guanajuato"],
    },
    {
      name: "Jamaica",
      code: "JM",
      states: ["Kingston", "Saint Andrew", "Saint James (Montego Bay)", "Saint Catherine", "Clarendon", "Manchester"],
    },
    {
      name: "Trinidad and Tobago",
      code: "TT",
      states: ["Port of Spain", "San Fernando", "Chaguanas", "Arima", "Tobago"],
    },
    {
      name: "Bahamas",
      code: "BS",
      states: ["New Providence (Nassau)", "Grand Bahama (Freeport)", "Abaco", "Eleuthera"],
    },
    {
      name: "Barbados",
      code: "BB",
      states: ["Saint Michael (Bridgetown)", "Christ Church", "Saint James", "Saint Philip"],
    },
    {
      name: "Haiti",
      code: "HT",
      states: ["Ouest (Port-au-Prince)", "Nord (Cap-Haïtien)", "Artibonite (Gonaïves)", "Sud (Les Cayes)"],
    },
    {
      name: "Dominican Republic",
      code: "DO",
      states: ["Distrito Nacional (Santo Domingo)", "Santiago", "San Cristóbal", "La Altagracia (Punta Cana)"],
    },
    {
      name: "Guatemala",
      code: "GT",
      states: ["Guatemala City", "Quetzaltenango", "Escuintla", "San Marcos", "Alta Verapaz"],
    },
    {
      name: "Costa Rica",
      code: "CR",
      states: ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas"],
    },
    {
      name: "Panama",
      code: "PA",
      states: ["Panamá City", "Panamá Oeste", "Chiriquí (David)", "Colón", "Coclé"],
    },
  ],
  "South America": [
    {
      name: "Brazil",
      code: "BR",
      states: ["São Paulo", "Rio de Janeiro", "Bahia (Salvador)", "Minas Gerais (Belo Horizonte)", "Paraná (Curitiba)", "Rio Grande do Sul (Porto Alegre)", "Distrito Federal (Brasília)"],
    },
    {
      name: "Colombia",
      code: "CO",
      states: ["Bogota D.C.", "Antioquia (Medellin)", "Valle del Cauca (Cali)", "Atlantico (Barranquilla)", "Santander (Bucaramanga)", "Bolívar (Cartagena)"],
    },
    {
      name: "Argentina",
      code: "AR",
      states: ["Buenos Aires City", "Buenos Aires Province", "Cordoba", "Santa Fe (Rosario)", "Mendoza", "Tucumán"],
    },
    {
      name: "Chile",
      code: "CL",
      states: ["Santiago Metropolitan", "Valparaíso", "Biobío (Concepción)", "Antofagasta", "Coquimbo (La Serena)"],
    },
    {
      name: "Peru",
      code: "PE",
      states: ["Lima Metropolitan", "Arequipa", "La Libertad (Trujillo)", "Piura", "Cusco", "Lambayeque (Chiclayo)"],
    },
    {
      name: "Venezuela",
      code: "VE",
      states: ["Capital District (Caracas)", "Zulia (Maracaibo)", "Carabobo (Valencia)", "Miranda", "Lara (Barquisimeto)"],
    },
    {
      name: "Ecuador",
      code: "EC",
      states: ["Pichincha (Quito)", "Guayas (Guayaquil)", "Azuay (Cuenca)", "Manabí (Manta/Portoviejo)"],
    },
    {
      name: "Bolivia",
      code: "BO",
      states: ["Santa Cruz", "La Paz", "Cochabamba", "Chuquisaca (Sucre)", "Oruro", "Tarija"],
    },
    {
      name: "Paraguay",
      code: "PY",
      states: ["Asunción", "Central", "Alto Paraná (Ciudad del Este)", "Itapúa (Encarnación)"],
    },
    {
      name: "Uruguay",
      code: "UY",
      states: ["Montevideo", "Canelones", "Maldonado (Punta del Este)", "Salto", "Paysandú"],
    },
    {
      name: "Guyana",
      code: "GY",
      states: ["Demerara-Mahaica (Georgetown)", "East Berbice-Corentyne", "Essequibo Islands-West Demerara"],
    },
    {
      name: "Suriname",
      code: "SR",
      states: ["Paramaribo", "Wanica", "Nickerie", "Commewijne"],
    },
  ],
  Asia: [
    {
      name: "India",
      code: "IN",
      states: ["Maharashtra (Mumbai)", "Delhi NCR", "Karnataka (Bengaluru)", "Tamil Nadu (Chennai)", "Telangana (Hyderabad)", "West Bengal (Kolkata)", "Gujarat (Ahmedabad)", "Kerala", "Punjab", "Uttar Pradesh"],
    },
    {
      name: "Philippines",
      code: "PH",
      states: ["Metro Manila", "Cebu", "Davao", "Central Luzon", "Calabarzon", "Western Visayas (Iloilo)", "Northern Mindanao (Cagayan de Oro)"],
    },
    {
      name: "United Arab Emirates",
      code: "AE",
      states: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
    },
    {
      name: "Israel",
      code: "IL",
      states: ["Jerusalem District", "Tel Aviv District", "Central District", "Northern District (Haifa/Nazareth)", "Southern District (Beersheba)"],
    },
    {
      name: "Malaysia",
      code: "MY",
      states: ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sarawak (Kuching)", "Sabah (Kota Kinabalu)", "Perak"],
    },
    {
      name: "Singapore",
      code: "SG",
      states: ["Central Region", "East Region", "West Region", "North Region", "North-East Region"],
    },
    {
      name: "Saudi Arabia",
      code: "SA",
      states: ["Riyadh", "Makkah (Jeddah)", "Eastern Province (Dammam/Khobar)", "Madinah", "Asir"],
    },
    {
      name: "Qatar",
      code: "QA",
      states: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
    },
    {
      name: "Kuwait",
      code: "KW",
      states: ["Al Asimah (Kuwait City)", "Hawalli", "Al Farwaniyah", "Al Ahmadi"],
    },
    {
      name: "South Korea",
      code: "KR",
      states: ["Seoul", "Gyeonggi Province", "Busan", "Incheon", "Daegu", "Daejeon"],
    },
    {
      name: "Japan",
      code: "JP",
      states: ["Tokyo", "Osaka", "Kanagawa (Yokohama)", "Aichi (Nagoya)", "Kyoto", "Hokkaido (Sapporo)", "Fukuoka"],
    },
    {
      name: "Pakistan",
      code: "PK",
      states: ["Punjab (Lahore)", "Sindh (Karachi)", "Islamabad Capital Territory", "Khyber Pakhtunkhwa (Peshawar)", "Balochistan (Quetta)"],
    },
    {
      name: "Bangladesh",
      code: "BD",
      states: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"],
    },
    {
      name: "Indonesia",
      code: "ID",
      states: ["Jakarta", "West Java (Bandung)", "East Java (Surabaya)", "Central Java (Semarang)", "North Sumatra (Medan)", "Bali (Denpasar)"],
    },
    {
      name: "Vietnam",
      code: "VN",
      states: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"],
    },
    {
      name: "Thailand",
      code: "TH",
      states: ["Bangkok", "Chiang Mai", "Phuket", "Chonburi (Pattaya)", "Nakhon Ratchasima"],
    },
  ],
  Oceania: [
    {
      name: "Australia",
      code: "AU",
      states: ["New South Wales (Sydney)", "Victoria (Melbourne)", "Queensland (Brisbane)", "Western Australia (Perth)", "South Australia (Adelaide)", "Tasmania (Hobart)", "Australian Capital Territory (Canberra)"],
    },
    {
      name: "New Zealand",
      code: "NZ",
      states: ["Auckland", "Wellington", "Canterbury (Christchurch)", "Waikato (Hamilton)", "Otago (Dunedin)", "Bay of Plenty (Tauranga)"],
    },
    {
      name: "Papua New Guinea",
      code: "PG",
      states: ["National Capital District (Port Moresby)", "Morobe (Lae)", "Western Highlands (Mount Hagen)", "Eastern Highlands (Goroka)"],
    },
    {
      name: "Fiji",
      code: "FJ",
      states: ["Central Division (Suva)", "Western Division (Nadi/Lautoka)", "Northern Division (Labasa)"],
    },
    {
      name: "Samoa",
      code: "WS",
      states: ["Tuamasaga (Apia)", "A'ana", "Atua", "Fa'asaleleaga"],
    },
    {
      name: "Solomon Islands",
      code: "SB",
      states: ["Honiara", "Guadalcanal", "Malaita", "Western Province"],
    },
    {
      name: "Vanuatu",
      code: "VU",
      states: ["Shefa (Port Vila)", "Sanma (Luganville)", "Tafea"],
    },
  ],
};
