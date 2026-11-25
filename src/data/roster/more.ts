/**
 * Extra primes appended to the eighteen-man books.
 * Every row is a real player, rated at a prime already on record.
 * Deep and short seats only: they do not reopen the starting five.
 */
export const MORE_ROSTERS: Record<string, string> = {
  cont: `
James Worthy|SF|6-9|1987|United States|deep|standard|slasher|88|22|8|0|-|shot:88,ath:90,def:78,ft:78
Chris Mullin|SG|6-6|1992|United States|deep|standard|shooter|87|24|24|0|SF|shot:90,three:78,play:80,ft:88
Hal Greer|SG|6-2|1967|United States|deep|standard|slasher|84|22|6|0|-|shot:86,ath:80,ft:80
Sam Jones|SG|6-4|1965|United States|deep|standard|slasher|85|22|8|0|-|shot:86,ath:84,clutch:90
`,
  vngd: `
Grant Hill|SF|6-8|1997|United States|deep|standard|slasher|88|24|18|0|PF|ath:90,play:82,shot:84,def:78|Prime is the Detroit years, before the ankle injuries.
Chauncey Billups|PG|6-3|2006|United States|deep|standard|point|86|22|36|0|-|play:88,three:80,def:80,clutch:92
Shawn Kemp|PF|6-10|1996|United States|deep|standard|rim|85|22|4|0|-|ath:92,reb:88,def:74
Alex English|SF|6-7|1983|United States|deep|standard|wing|86|26|8|0|-|shot:90,ft:84,play:70
`,
  aftr: `
Pete Maravich|SG|6-5|1977|United States|deep|standard|creator|87|30|10|0|-|shot:90,play:86,ath:80,ft:78
Nate Thurmond|C|6-11|1967|United States|deep|standard|rim|86|16|0|0|-|reb:94,def:92,ath:80
Earl Monroe|SG|6-3|1969|United States|deep|standard|slasher|86|26|8|0|-|shot:88,ath:88,play:74
Wes Unseld|C|6-7|1969|United States|deep|standard|glue|84|14|0|0|PF|reb:96,play:80,def:86
`,
  pall: `
Vince Carter|SG|6-6|2001|United States|deep|standard|slasher|88|26|28|0|SF|ath:97,shot:86,def:74
Paul Pierce|SF|6-7|2008|United States|deep|standard|wing|87|26|34|0|-|shot:84,three:80,play:78,clutch:94
Amar'e Stoudemire|PF|6-10|2007|United States|deep|standard|rim|86|26|6|0|-|ath:90,shot:84,reb:78
Blake Griffin|PF|6-9|2014|United States|deep|standard|slasher|85|24|18|0|-|ath:94,play:76,reb:82
`,
  lant: `
Jakob Poeltl|C|7-1|2022|Austria|deep|standard|rim|80|14|8|0|-|def:84,reb:84|Austria cannot fill a competitive all-time roster.
Petteri Koponen|PG|6-4|2011|Finland|deep|standard|point|74|14|36|0|-|play:80,three:76|Finland cannot fill a competitive all-time roster.
Greivis Vasquez|PG|6-6|2013|Venezuela|deep|standard|point|76|20|34|0|-|play:84,three:74|Venezuela cannot fill a competitive all-time roster.
Gheorghe Muresan|C|7-7|1996|Romania|deep|short|post|73|16|0|0|-|shot:70,reb:78|Romania cannot fill a competitive all-time roster.
`,
  nrth: `
Nickeil Alexander-Walker|SG|6-5|2024|Canada|deep|standard|wing|78|16|38|0|-|def:78,ath:82,three:76
Andrew Nembhard|PG|6-5|2024|Canada|deep|standard|point|77|14|34|0|-|play:82,def:80,three:74
Shaedon Sharpe|SG|6-5|2025|Canada|deep|standard|slasher|76|18|32|0|-|ath:90,shot:74|Rated on the prime already on record.
Lu Dort|SG|6-3|2023|Canada|deep|short|defender|80|14|36|0|SF|def:86
`,
  oro: `
Serge Ibaka|PF|6-10|2016|Spain|deep|standard|rim|82|16|22|0|C|def:88,reb:80,ath:84|Born in Brazzaville. Represented Spain.
Santi Aldama|PF|7-0|2024|Spain|deep|standard|stretch|76|14|36|0|-|three:78,reb:74,play:70
Alex Abrines|SG|6-6|2017|Spain|deep|standard|shooter|74|12|44|0|-|three:82,def:72
Usman Garuba|PF|6-8|2023|Spain|deep|short|defender|73|10|16|0|-|def:82,reb:74
`,
  roya: `
Isaia Cordinier|SG|6-5|2024|France|deep|standard|wing|76|16|36|0|-|ath:86,def:78,three:74
Joffrey Lauvergne|PF|6-11|2016|France|deep|standard|stretch|74|14|28|0|C|reb:74,shot:72
Vincent Poirier|C|7-0|2019|France|deep|standard|rim|74|12|8|0|-|def:78,reb:78
Andrew Albicy|PG|5-10|2014|France|deep|short|point|73|12|28|0|-|play:82,def:80
`,
  eagl: `
Nemanja Nedovic|SG|6-4|2016|Serbia|deep|standard|slasher|75|18|32|0|-|ath:84,shot:76
Nikola Kalinic|SF|6-8|2016|Serbia|deep|standard|wing|75|14|34|0|-|three:74,play:76
Filip Petrusev|C|6-11|2023|Serbia|deep|standard|post|76|16|16|0|-|shot:78,reb:76
Stefan Jovic|PG|6-2|2017|Serbia|deep|short|point|74|14|30|0|-|play:84,def:72
`,
  fire: `
Ante Zizic|C|6-10|2018|Croatia|deep|standard|rim|73|12|4|0|-|reb:76,ath:78
Damjan Rudez|SF|6-9|2015|Croatia|deep|standard|shooter|73|14|42|0|-|three:80
Krunoslav Simon|SG|6-6|2016|Croatia|deep|standard|wing|74|14|36|0|-|play:76,three:74
Karlo Matkovic|C|6-10|2024|Croatia|deep|short|rim|74|12|8|0|-|ath:82,reb:74|Rated on the prime already on record.
`,
  alps: `
Anthony Randolph|PF|6-11|2013|Slovenia|deep|standard|stretch|76|16|28|0|-|ath:84,reb:76|Born in Germany, raised in the United States. Represented Slovenia.
Mike Tobey|C|7-0|2019|Slovenia|deep|standard|rim|74|12|12|0|-|reb:78|American-born. Represented Slovenia.
Alen Omic|C|6-11|2016|Slovenia|deep|standard|post|73|14|4|0|-|reb:76
Aleksej Nikolic|PG|6-3|2018|Slovenia|deep|short|point|72|12|32|0|-|play:76
`,
  ambr: `
Ignas Brazdeikis|SF|6-6|2021|Lithuania|deep|standard|wing|74|16|34|0|-|ath:82,shot:74|Born in Lithuania, raised in Canada. Represented Lithuania.
Arturas Karnisovas|SF|6-8|1996|Lithuania|deep|standard|wing|74|14|28|0|-|shot:76,ath:78
Gintaras Einikis|C|6-10|1996|Lithuania|deep|standard|post|73|14|6|0|-|reb:74
Deividas Sirvydis|SF|6-8|2022|Lithuania|deep|short|shooter|72|12|40|0|-|three:76
`,
  ordr: `
Nikos Zisis|PG|6-4|2006|Greece|deep|standard|point|74|14|28|0|-|play:80,def:76
Ioannis Papapetrou|SF|6-8|2017|Greece|deep|standard|wing|75|16|34|0|-|ath:82,three:72
Fragiskos Alvertis|SF|6-9|1997|Greece|deep|standard|wing|74|14|30|0|-|shot:78
Efthimis Rentzias|C|6-11|1998|Greece|deep|short|post|73|14|4|0|-|reb:74
`,
  plat: `
Luca Vildoza|PG|6-3|2021|Argentina|deep|standard|point|75|16|36|0|-|play:82,ath:82
Patricio Garino|SF|6-6|2017|Argentina|deep|standard|wing|73|12|34|0|-|def:76,ath:78
Leandro Bolmaro|SG|6-6|2022|Argentina|deep|standard|wing|73|14|32|0|-|ath:82,play:74
Tayavek Gallizzi|C|6-9|2016|Argentina|deep|short|rim|72|10|4|0|-|def:76,reb:74
`,
  auri: `
Yago dos Santos|PG|6-0|2024|Brazil|deep|standard|point|76|18|34|0|-|play:84,ath:86
Scott Machado|PG|6-1|2016|Brazil|deep|standard|point|74|16|34|0|-|play:80|American-born. Represented Brazil.
Leo Meindl|SF|6-7|2019|Brazil|deep|standard|wing|73|14|36|0|-|three:76
Davi Rossetto|PG|6-1|2022|Brazil|deep|short|point|72|12|32|0|-|play:74
`,
  sun: `
Josh Green|SG|6-5|2024|Australia|deep|standard|wing|76|14|36|0|-|ath:86,def:80,three:74
Duop Reath|C|6-10|2024|Australia|deep|standard|stretch|74|14|34|0|-|three:76,reb:72|Born in South Sudan. Represented Australia.
Chris Goulding|SG|6-4|2014|Australia|deep|standard|shooter|74|16|44|0|-|three:82
Jack White|SF|6-7|2023|Australia|deep|short|defender|73|10|34|0|-|def:80,ath:82
`,
  iron: `
Tristan da Silva|PF|6-8|2025|Germany|deep|standard|stretch|75|14|36|0|-|three:78,play:74|Rated on the prime already on record.
Johannes Voigtmann|C|7-0|2018|Germany|deep|standard|stretch|74|12|32|0|-|play:76,three:74,reb:72
Nick Weiler-Babb|SG|6-5|2023|Germany|deep|standard|wing|73|12|32|0|-|def:78,ath:80|American-born. Represented Germany.
Oscar da Silva|PF|6-9|2022|Germany|deep|short|glue|73|12|24|0|-|play:74,reb:72
`,
  atlr: `
Pietro Aradori|SG|6-5|2015|Italy|deep|standard|wing|73|14|36|0|-|three:76
Awudu Abass|SF|6-7|2018|Italy|deep|standard|slasher|73|14|16|0|-|ath:84,def:76|Born in Ghana. Represented Italy.
Travis Diener|PG|6-1|2008|Italy|deep|standard|point|73|14|38|0|-|three:80,play:76|American-born. Represented Italy.
Matteo Spagnolo|PG|6-3|2024|Italy|deep|short|point|72|14|34|0|-|play:74,ath:80|Rated on the prime already on record.
`,
  grns: `
Chima Moneke|PF|6-6|2023|Nigeria|deep|standard|slasher|75|16|22|0|SF|ath:86,reb:76,def:74
Semi Ojeleye|SF|6-6|2019|Nigeria|deep|standard|defender|73|12|36|0|-|def:78,three:74
Daniel Oturu|C|6-10|2022|Nigeria|deep|standard|rim|73|12|8|0|-|reb:78,ath:82
Michael Gbinije|SG|6-7|2017|Nigeria|deep|short|wing|72|14|32|0|-|ath:82,play:72|Represented Nigeria.
`,
  crsc: `
Bobby Dixon|PG|6-0|2012|Turkey|deep|standard|point|74|16|34|0|-|ath:84,play:76|Also known as Ali Muhammed. American-born. Represented Turkey.
Emir Preldzic|SF|6-9|2012|Turkey|deep|standard|wing|73|14|34|0|-|three:76|Born in Bosnia. Represented Turkey.
Onuralp Bitim|SG|6-6|2024|Turkey|deep|standard|wing|73|16|36|0|-|ath:80,three:74|Rated on the prime already on record.
Dogus Balbay|PG|6-0|2011|Turkey|deep|short|defender|72|10|24|0|-|def:80
`,
  fueg: `
Walter Hodge|PG|6-0|2011|Puerto Rico|deep|standard|point|74|16|34|0|-|play:78,three:74|Born in the U.S. Virgin Islands. Represented Puerto Rico.
Gary Browne|PG|6-1|2016|Puerto Rico|deep|standard|point|73|14|32|0|-|ath:80
Isaiah Pineiro|SF|6-7|2021|Puerto Rico|deep|standard|wing|73|14|34|0|-|ath:82,shot:74
Aleem Ford|SF|6-8|2021|Puerto Rico|deep|short|shooter|72|12|40|0|-|three:76
`,
  quis: `
Jean Montero|PG|6-2|2024|Dominican Republic|deep|standard|point|74|18|30|0|-|ath:84,play:76|Rated on the prime already on record.
Edgar Sosa|PG|6-1|2011|Dominican Republic|deep|standard|point|73|16|32|0|-|play:78,ath:80|American-born. Represented the Dominican Republic.
Luis David Montero|SG|6-7|2016|Dominican Republic|deep|standard|wing|73|16|34|0|-|ath:84
Eulis Baez|PF|6-8|2014|Dominican Republic|deep|short|stretch|72|12|30|0|-|three:72,reb:70
`,
  tera: `
Ibrahima Fall Faye|C|6-10|2024|Senegal|deep|standard|rim|73|12|8|0|-|reb:76,def:76
Youssoupha Fall|C|7-2|2022|Senegal|deep|standard|post|73|14|4|0|-|reb:78
Jean Jacques Boissy|PG|6-4|2016|Senegal|deep|standard|point|72|14|28|0|-|play:76,ath:80
Khalifa Diop|C|6-11|2023|Senegal|deep|short|rim|72|10|4|0|-|def:76,reb:74
`,
  gate: `
Kristaps Valters|PG|6-2|2004|Latvia|deep|standard|point|73|16|32|0|-|play:78,ath:80
Uvis Helmanis|PF|6-9|1998|Latvia|deep|standard|post|73|14|8|0|-|reb:76
Raimonds Vilde|C|6-10|1988|Latvia|deep|standard|post|72|12|4|0|-|reb:74|Soviet-era career. Assigned to Latvia.
Ainars Bagatskis|SF|6-8|1993|Latvia|deep|short|wing|72|12|24|0|-|shot:72
`,
  peak: `
Justin Doellman|PF|6-9|2014|Montenegro|deep|standard|stretch|74|14|34|0|-|three:78,shot:74|American-born. Represented Montenegro.
Derek Needham|PG|5-11|2014|Montenegro|deep|standard|point|73|16|36|0|-|play:78,ath:82|American-born. Represented Montenegro.
Marko Simonovic|C|6-11|2016|Montenegro|deep|standard|rim|73|12|8|0|-|def:76,reb:74|The EuroLeague center.
Nemanja Djurisic|SF|6-8|2016|Montenegro|deep|short|wing|72|14|30|0|-|ath:78,shot:70
`,
  cauc: `
Jacob Pullen|PG|6-0|2012|Georgia|deep|standard|point|74|18|38|0|-|three:80,ath:82|American-born. Represented Georgia.
Taurean Green|PG|6-0|2010|Georgia|deep|standard|point|73|16|32|0|-|play:76,ath:82|American-born. Represented Georgia.
Beka Burjanadze|PF|6-9|2019|Georgia|deep|standard|post|72|12|16|0|-|reb:72
Giorgi Gamqrelidze|SF|6-6|2008|Georgia|deep|short|wing|71|12|28|0|-|shot:70
`,
  brdg: `
Damir Mrsic|SG|6-5|2001|Bosnia and Herzegovina|deep|standard|shooter|73|16|40|0|-|three:80
Jasmin Hukic|SG|6-5|2004|Bosnia and Herzegovina|deep|standard|wing|72|14|34|0|-|three:74
Alex Renfroe|PG|6-3|2014|Bosnia and Herzegovina|deep|standard|point|73|16|32|0|-|play:78|American-born. Represented Bosnia and Herzegovina.
Adin Vrabac|SF|6-8|2016|Bosnia and Herzegovina|deep|short|wing|72|12|32|0|-|ath:80
`,
  drgn: `
Sun Minghui|PG|6-2|2019|China|deep|standard|point|73|16|32|0|-|play:78,ath:80
Hu Jinqiu|C|6-11|2023|China|deep|standard|post|73|14|8|0|-|reb:76,shot:72
Fang Shuo|PG|6-2|2016|China|deep|standard|point|72|14|30|0|-|play:76
Zhang Zhenlin|SF|6-8|2022|China|deep|short|wing|72|12|30|0|-|ath:80,shot:70
`,
  arch: `
Justin Brownlee|SF|6-6|2018|Philippines|deep|standard|wing|76|18|34|0|-|shot:78,ath:82,three:72|American-born. Represented the Philippines.
Andray Blatche|PF|6-11|2014|Philippines|deep|standard|post|78|20|16|0|C|shot:76,reb:80,ath:78|American-born. Represented the Philippines.
Greg Slaughter|C|7-0|2014|Philippines|deep|standard|rim|74|12|4|0|-|reb:78,def:76
Terrence Romeo|PG|5-11|2016|Philippines|deep|short|point|73|18|34|0|-|ath:84,play:74
`,
  flve: `
Damion Baugh|PG|6-3|2024|DR Congo|deep|standard|point|74|16|32|0|-|play:78,ath:80|American-born. Represented DR Congo.
Elijah Lufile|C|6-9|2024|DR Congo|deep|standard|rim|72|12|8|0|-|reb:76,ath:78
Florent Thamba|C|6-10|2023|DR Congo|deep|standard|rim|71|10|4|0|-|reb:72,def:70
Johnathan Jordan|PG|5-11|2022|DR Congo|deep|short|point|72|16|30|0|-|play:76,ath:80|Represented DR Congo.
`,
  oliv: `
Roman Sorkin|C|6-10|2019|Israel|deep|standard|post|73|14|12|0|-|reb:76,shot:72|Born in Russia. Represented Israel.
Jake Cohen|PF|6-10|2015|Israel|deep|standard|stretch|74|14|34|0|-|three:76,reb:74|American-born. Represented Israel.
Yovel Zoosman|SF|6-7|2021|Israel|deep|standard|wing|73|12|32|0|-|def:76,ath:80
Dror Hagag|PG|6-0|1999|Israel|deep|short|point|72|14|30|0|-|play:78,ath:80
`,
  nvsk: `
Evgeny Pashutin|SG|6-6|1999|Russia|deep|standard|wing|73|14|32|0|-|shot:76,ath:78
Zakhar Pashutin|SG|6-4|2002|Russia|deep|standard|shooter|73|16|38|0|-|three:78
Vasily Karasev|SF|6-7|1994|Russia|deep|standard|wing|73|16|20|0|-|shot:78,play:74
Sergei Bykov|PG|6-2|2008|Russia|deep|short|point|72|14|32|0|-|play:76
`,
};
