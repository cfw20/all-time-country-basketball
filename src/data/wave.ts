import type { Team } from "./types";

/** Overflow houses past the first cut. Real primes the houses above them never minuted. */
function house(
  id: string,
  rank: number,
  name: string,
  code: string,
  primary: string,
  secondary: string,
  mark: Team["mark"],
  motto: string,
  blurb: string,
  pace = 1,
): Team {
  return {
    id,
    kind: "overflow",
    country: "United States",
    name,
    nickname: name.replace(/^The /, ""),
    code,
    region: "Overflow",
    colors: { primary, secondary },
    mark,
    motto,
    blurb,
    pace,
    overflowRank: rank,
  };
}

export const WAVE_TEAMS: Team[] = [
  house(
    "lntl",
    27,
    "The Lintel",
    "LNT",
    "#f0a7b5",
    "#6e2c44",
    "diamond",
    "The beam the first cut never used.",
    "Rudy LaRusso, Gene Shue, Harry Gallatin, Carl Braun, and Don Kojis. Hall of Fame and All-Star primes from the years the later houses had already filled with other legends. Americans. The minutes above them were gone.",
    0.98,
  ),
  house(
    "orry",
    28,
    "The Orrery",
    "ORR",
    "#9fd6ff",
    "#243e5c",
    "ring",
    "The night still turns.",
    "Herb Jones, Trey Murphy III, Devin Vassell, Lonzo Ball, and Daniel Gafford, rated on primes already on record. A modern wing book the houses above them could not minute.",
    1.02,
  ),
  house(
    "nave",
    29,
    "The Nave",
    "NAV",
    "#e7c27a",
    "#6a4a16",
    "arch",
    "The long room.",
    "Dick McGuire, Kevin Loughery, Ray Scott, Len Chappell, and Clyde Lee. A long room of primes from the 1950s through the 1970s, with the connectors who actually played beside them.",
    0.97,
  ),
  house(
    "crnc",
    30,
    "The Cornice",
    "CNC",
    "#c9b6ff",
    "#3c2f66",
    "shield",
    "The edge that still catches light.",
    "Coby White, Willie Wise, Happy Hairston, Bob Kauffman, and Tom Meschery. All-Star primes and the 2025 scoring guard the mountain never found a night for. The edge of the book, and still a series.",
    1.01,
  ),
  house(
    "mull",
    31,
    "The Mullion",
    "MUL",
    "#f0a7b5",
    "#5c2a44",
    "diamond",
    "The bar that holds the glass.",
    "Jimmy Jones, Otis Birdsong, Billy Knight, Marvin Barnes, and Ed Macauley. ABA All-Stars and an NBA All-Star center whose 1956 season still sits inside the window. Americans the houses above them never minuted.",
    1.02,
  ),
  house(
    "quon",
    32,
    "The Quoin",
    "QUN",
    "#e4d2b0",
    "#5c4632",
    "arch",
    "The stone at the corner.",
    "Larry Brown, Larry Jones, Doug Moe, Antonio Davis, and Joe Barry Carroll. The corner where the ABA book and a later All-Star big still hold. A house, further down the mountain, and still a series.",
    0.98,
  ),
  house(
    "apse",
    33,
    "The Apse",
    "APS",
    "#c9b6ff",
    "#3a2a62",
    "ring",
    "The curve behind the altar.",
    "Ty Lawson, Dick Garmaker, Eddie Johnson, Keith Van Horn, and Rony Seikaly. A curve of primes from the 1950s through the 2010s. The minutes above them were gone. The primes were not.",
    1.02,
  ),
  house(
    "spir",
    34,
    "The Spire",
    "SPR",
    "#9fd6ff",
    "#1d3f5c",
    "bars",
    "The point that still clears the roof.",
    "Johnny Moore, Bob Verga, John Brisker, Jayson Williams, and Elmore Smith. The last American cut: assists, ABA scoring, and a rim that still matters. Not a pile of fillers.",
    1.0,
  ),
  house(
    "trns",
    35,
    "The Transept",
    "TRN",
    "#f0a7b5",
    "#6e2c44",
    "diamond",
    "The cross room still scores.",
    "Rickey Green, John Johnson, Herb Williams, Rex Chapman, and Charles Smith. All-Star and 20-point primes the houses above them never minuted. A scoring book, in the stronger overflow band.",
    1.02,
  ),
  house(
    "cler",
    36,
    "The Clerestory",
    "CLR",
    "#9fd6ff",
    "#1d3f5c",
    "ring",
    "Light from the high windows.",
    "Brandin Podziemski, Payton Pritchard, Christian Braun, Seth Curry, and Dorian Finney-Smith, rated on primes already on record. A modern wing book the mountain never found a night for.",
    1.03,
  ),
  house(
    "ambl",
    37,
    "The Ambulatory",
    "AMB",
    "#8fd0c6",
    "#1d4f4a",
    "shield",
    "The walk around the altar.",
    "Derek Fisher, Hubert Davis, Jared Dudley, Brandon Bass, and Delonte West. Closers and connectors from the title years, on a house that can play a series.",
    1.0,
  ),
  house(
    "kyst",
    38,
    "The Keystone",
    "KYS",
    "#e7c27a",
    "#6a4a16",
    "arch",
    "The stone that locks the arch.",
    "T.R. Dunn, Dwight Jones, Kyle Macy, Dave Meyers, and Dave Corzine. Defenders and double-figure primes from 1976 through 1986. The arch holds.",
    0.99,
  ),
];

export const WAVE_ROSTERS: Record<string, string> = {
  lntl: `
Gene Shue|PG|6-2|1961|United States|star|standard|point|85|24|4|1|-|play:90,shot:80,def:74|All-Star point guard of the early 1960s.
Carl Braun|SG|6-5|1957|United States|star|standard|shooter|84|26|4|1|-|shot:84,ft:84|Hall of Fame guard. The 1957 All-Star season.
Don Kojis|SF|6-5|1968|United States|star|standard|wing|83|24|4|1|PF|shot:82,ath:82,reb:74|All-Star wing in 1968 and 1969.
Rudy LaRusso|PF|6-7|1968|United States|star|standard|post|86|26|2|1|SF|shot:84,reb:86,def:78|All-Star forward for the Lakers and the Warriors.
Harry Gallatin|C|6-6|1956|United States|star|standard|post|85|22|0|1|PF|reb:90,def:80,shot:80|Hall of Fame. The 1956 All-Star season is the prime inside the window.
Johnny Kerr|C|6-9|1966|United States|starter|standard|post|83|20|0|0|-|reb:84,def:78,shot:78|Three-time All-Star center.
Kenny Sears|PF|6-9|1959|United States|starter|standard|post|82|22|2|0|-|shot:80,reb:80|All-Star forward at the end of the 1950s.
Tom Van Arsdale|SG|6-5|1971|United States|starter|standard|shooter|83|24|6|0|SF|shot:82,ath:80|All-Star guard. Not the same prime as his brother.
Flynn Robinson|SG|6-1|1969|United States|rotation|standard|slasher|82|26|4|0|-|shot:84,ath:82|Scoring guard. The 1969 prime.
Eddie Miles|SG|6-4|1966|United States|rotation|standard|shooter|81|22|4|0|-|shot:80,ft:82|All-Star guard in 1966.
Adrian Smith|SG|6-1|1966|United States|rotation|standard|shooter|81|20|6|0|-|shot:82,ft:86|All-Star game MVP in 1966.
Bob Ferry|PF|6-8|1963|United States|rotation|standard|post|80|18|0|0|-|shot:78,reb:78|All-Star forward.
John Block|PF|6-9|1968|United States|rotation|standard|post|78|16|2|0|C|reb:78,shot:74|Forward-center of the late 1960s.
Larry Siegfried|SG|6-3|1969|United States|deep|standard|defender|79|14|4|0|PG|def:82,ft:84|Celtics guard. Defense and the line.
Wali Jones|SG|6-2|1968|United States|deep|standard|wing|79|16|6|0|-|def:78,ath:80|Champion guard on the 1967 Sixers.
Neal Walk|C|6-10|1973|United States|deep|standard|post|79|16|0|0|-|reb:80,shot:76|Suns center of the early 1970s.
Clem Haskins|PG|6-3|1968|United States|deep|standard|point|79|18|4|0|-|play:80,shot:78|Point guard of the late 1960s.
Dave Stallworth|PF|6-7|1967|United States|deep|standard|glue|78|16|2|0|-|reb:76,def:76|Knicks forward.
Keith Erickson|SF|6-5|1972|United States|deep|standard|wing|78|14|6|0|SG|def:78,ath:80|Lakers wing on the 1972 champions.
Butch Beard|PG|6-3|1974|United States|two-way|two-way|point|78|16|4|0|-|play:80,def:76|Knicks point guard.
Jim Barnett|SG|6-4|1972|United States|two-way|two-way|shooter|78|16|6|0|-|shot:78|Warriors scoring guard.
Joe Ellis|SF|6-6|1971|United States|deep|ten-day|wing|77|14|4|0|-|def:74|Warriors forward. A short seat under the stars.
`,
  orry: `
Lonzo Ball|PG|6-6|2021|United States|star|standard|point|84|22|28|1|-|play:88,def:84,ath:84,reb:70|The 2021 Bulls prime, before the knee.
Devin Vassell|SG|6-5|2024|United States|star|standard|wing|84|26|36|1|SF|shot:82,def:80,ath:84|The 2024 wing prime already on record.
Herb Jones|SF|6-7|2024|United States|star|standard|defender|85|16|28|1|PF|def:90,ath:86,reb:72,shot:76|All-Defense wing. The 2024 prime.
Trey Murphy III|SF|6-9|2025|United States|star|standard|shooter|85|24|42|1|SG|three:90,shot:84,ath:84|The 2025 shooting prime already on record.
Daniel Gafford|C|6-10|2024|United States|star|standard|rim|83|16|0|1|PF|reb:84,def:86,ath:88,shot:80|Rim runner. The 2024 prime.
Ayo Dosunmu|PG|6-4|2024|United States|starter|standard|wing|80|18|34|0|-|ath:84,def:78,play:76|Two-way guard who became a starter. The 2024 prime.
Tari Eason|PF|6-8|2025|United States|starter|standard|defender|82|18|30|0|SF|def:86,ath:86,reb:78|Energy forward. The 2025 prime already on record.
Keldon Johnson|SF|6-6|2023|United States|starter|standard|slasher|82|26|32|0|PF|shot:80,ath:84|The 2023 scoring season.
Aaron Nesmith|SF|6-6|2025|United States|rotation|standard|defender|82|16|38|0|SG|def:84,three:82,ath:82|The 2025 two-way wing prime.
Patrick Williams|PF|6-7|2024|United States|rotation|standard|wing|80|16|32|0|SF|def:80,ath:82|The 2024 prime already on record, not a projection.
Tyus Jones|PG|6-0|2025|United States|rotation|standard|point|80|14|36|0|-|play:88,three:78,def:74|Connector. The 2025 prime.
Isaiah Joe|SG|6-4|2025|United States|rotation|standard|shooter|80|16|44|0|-|three:88,shot:78|Movement shooter. The 2025 prime.
Jaime Jaquez Jr.|SF|6-6|2024|United States|rotation|standard|wing|81|22|28|0|PF|shot:80,def:76,ath:80|The 2024 rookie prime, the one already on record.
Aaron Wiggins|SG|6-5|2025|United States|deep|standard|wing|80|16|36|0|SF|def:78,ath:82,three:78|The 2025 two-way wing prime.
Corey Kispert|SF|6-6|2024|United States|deep|standard|shooter|79|16|42|0|SG|three:86,shot:76|Spot-up wing.
Grant Williams|PF|6-6|2022|United States|deep|standard|stretch|79|14|38|0|-|three:80,def:76|Stretch forward. The 2022 prime.
Zach Collins|C|6-11|2023|United States|deep|standard|post|79|16|20|0|PF|reb:80,shot:76|The 2023 Spurs prime.
Kris Dunn|PG|6-3|2018|United States|deep|standard|defender|80|14|28|0|-|def:88,ath:84,play:74|The 2018 defensive prime.
Derrick Jones Jr.|SF|6-6|2024|United States|deep|standard|slasher|79|14|32|0|PF|ath:90,def:80|Athlete. The 2024 prime.
T.J. McConnell|PG|6-1|2021|United States|two-way|two-way|point|80|16|24|0|-|play:84,def:80|Backup point who runs a shift.
Alec Burks|SG|6-6|2021|United States|two-way|two-way|shooter|80|18|38|0|-|three:80,shot:78|Scoring guard off the bench. The 2021 prime.
Naji Marshall|SF|6-7|2025|United States|deep|ten-day|wing|79|16|32|0|PF|def:78,ath:80|The 2025 wing prime. A short seat.
`,
  nave: `
Dick McGuire|PG|6-0|1955|United States|star|standard|point|85|22|2|1|-|play:90,def:78,shot:76|Hall of Fame point guard. The 1955 All-Star season is the prime inside the window.
Kevin Loughery|SG|6-3|1968|United States|star|standard|slasher|84|26|4|1|-|shot:82,ath:80|Scoring guard, before the coaching years.
Ray Scott|SF|6-9|1964|United States|star|standard|wing|84|24|2|1|PF|shot:80,reb:82,def:76|Detroit forward of the early 1960s.
Len Chappell|PF|6-8|1963|United States|star|standard|post|84|22|0|1|-|shot:80,reb:82|All-Star forward in the early 1960s.
Clyde Lee|C|6-10|1968|United States|star|standard|rim|84|14|0|1|PF|reb:90,def:80|Rebounder. The Warriors glass was his.
Henry Bibby|PG|6-1|1974|United States|starter|standard|point|80|16|8|0|-|play:80,def:76,shot:74|Knicks and Sixers point guard.
Herm Gilliam|SG|6-3|1974|United States|starter|standard|wing|81|18|6|0|-|shot:78,ath:80,def:74|Blazers guard on the 1977 side, rated at the 1974 prime.
Luke Jackson|PF|6-9|1968|United States|starter|standard|post|80|18|0|0|-|reb:80,shot:76,def:74|Sixers forward beside the stars.
Mike Riordan|SF|6-5|1972|United States|rotation|standard|wing|78|14|6|0|-|def:76,shot:74|Knicks wing.
Dean Meminger|PG|6-0|1973|United States|rotation|standard|defender|78|12|4|0|-|def:82,play:74|Defensive guard. The 1973 prime.
Matt Guokas|SF|6-5|1973|United States|rotation|standard|glue|77|12|6|0|SG|play:74,def:72|Connector on the Sixers.
Darrall Imhoff|C|6-10|1964|United States|rotation|standard|rim|78|12|0|0|-|reb:80,def:78|Defensive center.
Mel Counts|C|7-0|1966|United States|rotation|standard|post|78|14|0|0|-|reb:78,shot:74|Celtics and Lakers center.
Howard Komives|PG|6-1|1968|United States|deep|standard|shooter|80|16|6|0|-|shot:78,play:74|Knicks guard.
Em Bryant|SG|6-1|1969|United States|deep|standard|defender|80|14|4|0|-|def:80|Knicks guard on the title teams.
Connie Dierking|C|6-9|1968|United States|deep|standard|post|80|14|0|0|-|reb:78,shot:74|Center of the late 1960s.
Wayne Hightower|PF|6-8|1964|United States|deep|standard|wing|79|14|2|0|SF|ath:78,shot:74|Forward of the early 1960s.
Paul Neumann|SG|6-1|1963|United States|deep|standard|shooter|78|16|4|0|-|shot:76|Scoring guard.
Tom Hawkins|SF|6-5|1966|United States|deep|standard|wing|78|14|2|0|-|ath:80,def:74|Lakers forward.
Johnny Egan|PG|5-11|1965|United States|two-way|two-way|point|77|14|4|0|-|play:78,ath:76|Small point guard.
Jim Washington|PF|6-7|1968|United States|two-way|two-way|glue|77|12|2|0|-|reb:76,def:74|Forward.
Don May|SF|6-4|1969|United States|deep|ten-day|wing|76|14|4|0|-|ath:78|Knicks forward. A short seat.
`,
  crnc: `
Coby White|PG|6-5|2025|United States|star|standard|shooter|84|28|40|1|-|three:84,shot:82,ath:84,play:78|The 2025 scoring prime already on record.
Tim Hardaway Jr.|SG|6-5|2019|United States|star|standard|shooter|82|24|40|1|-|three:84,shot:80,ath:80|The 2019 Dallas scoring prime.
Willie Wise|SF|6-6|1972|United States|star|standard|wing|84|22|6|1|PF|shot:82,def:82,reb:80,ath:84|ABA All-Star forward. The 1972 prime.
Happy Hairston|PF|6-7|1972|United States|star|standard|rim|82|16|2|1|SF|reb:90,def:78,shot:76|The 1972 glass season with the Lakers.
Bob Kauffman|C|6-8|1972|United States|star|standard|post|83|22|0|1|PF|shot:80,reb:84,def:76|Three-time All-Star in Buffalo.
Tom Meschery|PF|6-6|1963|United States|starter|standard|post|83|22|2|0|SF|shot:80,reb:82,ath:80|All-Star forward in 1963.
Saddiq Bey|SF|6-7|2022|United States|starter|standard|stretch|80|18|38|0|PF|three:80,shot:76|The 2022 stretch prime.
Terance Mann|SG|6-5|2021|United States|starter|standard|wing|80|16|34|0|SF|def:78,ath:82,three:74|The 2021 wing prime.
Stephon Castle|PG|6-6|2025|United States|rotation|standard|point|79|18|30|0|SG|def:80,play:76,ath:82|Rated on the 2025 prime already on record, not a projection.
Isaiah Jackson|C|6-10|2024|United States|rotation|standard|rim|80|14|4|0|PF|reb:82,def:82,ath:86|Rim protector. The 2024 prime.
Tre Jones|PG|6-1|2024|United States|rotation|standard|point|80|14|28|0|-|play:84,def:78|Connector point guard. The 2024 prime.
Marvin Bagley III|PF|6-11|2019|United States|rotation|standard|post|79|20|8|0|C|ath:84,reb:80,shot:76|The 2019 counting prime, not the years after it.
Cam Whitmore|SF|6-6|2024|United States|rotation|standard|slasher|78|18|34|0|-|ath:88,shot:76|The 2024 athletic prime already on record.
Devonte' Graham|PG|6-1|2020|United States|deep|standard|shooter|79|22|42|0|-|three:84,play:76|The 2020 shooting prime.
Isaac Okoro|SF|6-5|2023|United States|deep|standard|defender|79|12|32|0|-|def:84,ath:84|Wing defender. The 2023 prime.
Kenrich Williams|PF|6-6|2022|United States|deep|standard|glue|78|12|36|0|SF|def:80,reb:74|Connector forward.
Kel'el Ware|C|7-0|2025|United States|deep|standard|rim|78|12|8|0|-|reb:82,def:78,ath:80|Rated on the 2025 prime already on record, not a projection.
Jaden Hardy|SG|6-4|2024|United States|deep|standard|shooter|78|20|36|0|-|ath:84,three:76|Scoring guard off the bench.
Jalen Smith|PF|6-10|2022|United States|deep|standard|stretch|78|16|32|0|C|reb:80,ath:82,three:72|The 2022 stretch big.
Cason Wallace|PG|6-3|2025|United States|two-way|two-way|defender|79|12|34|0|-|def:86,ath:84,play:72|Defensive guard. The 2025 prime already on record.
Talen Horton-Tucker|SG|6-4|2021|United States|two-way|two-way|slasher|77|16|28|0|-|ath:84,play:72|The 2021 creation prime.
Reed Sheppard|PG|6-2|2025|United States|deep|ten-day|shooter|77|14|40|0|-|three:82,play:74|Rated on the 2025 prime already on record. A short seat.
`,
  mull: `
Jimmy Jones|PG|6-4|1971|United States|star|standard|point|84|22|8|1|-|play:86,shot:80,ath:82|ABA All-Star point guard. The Memphis and Utah prime.
Otis Birdsong|SG|6-3|1981|United States|star|standard|slasher|85|26|8|1|-|shot:86,ath:84,ft:82|Four-time All-Star. The 1981 Kings scoring prime.
Billy Knight|SF|6-6|1977|United States|star|standard|wing|83|24|16|1|PF|shot:82,ath:82,reb:74|ABA and NBA All-Star forward.
Marvin Barnes|PF|6-9|1975|United States|star|standard|post|84|24|4|1|-|shot:82,ath:84,reb:84,def:76|ABA All-Star. The Spirits prime, before the years after it.
Ed Macauley|C|6-8|1956|United States|star|standard|post|84|20|2|1|-|shot:84,play:78,reb:78|Hall of Fame. The 1956 All-Star season is the prime inside the window.
Ernie DiGregorio|PG|6-0|1974|United States|starter|standard|point|81|18|10|0|-|play:88,shot:76,ft:90|Rookie of the year. The 1974 assist prime, not the years after the knee.
John Williamson|SG|6-2|1978|United States|starter|standard|slasher|81|24|8|0|-|shot:82,ath:80|Nets scoring guard. The late-1970s prime.
Dell Curry|SG|6-5|1994|United States|starter|standard|shooter|81|18|40|0|-|three:84,shot:80|Sixth man of the year. The 1994 Hornets prime.
Don Buse|PG|6-4|1976|United States|rotation|standard|defender|81|14|12|0|-|play:86,def:86,shot:74|ABA assist leader and an All-Defensive guard.
Fred Brown|SG|6-3|1979|United States|rotation|standard|shooter|80|16|32|0|-|three:80,shot:78|Downtown. The 1979 champion shooter.
Steve Mix|SF|6-7|1976|United States|rotation|standard|wing|79|16|8|0|-|shot:78,reb:76|1975 All-Star forward.
Mickey Johnson|PF|6-10|1978|United States|rotation|standard|stretch|80|18|12|0|SF|shot:80,ath:78|Scoring forward of the late 1970s.
Bob Netolicky|PF|6-9|1970|United States|rotation|standard|post|80|18|4|0|-|shot:78,reb:78|ABA All-Star. The Pacers prime.
Clifford Ray|C|6-9|1976|United States|deep|standard|rim|80|12|0|0|-|reb:82,def:82|Warriors champion center. The glass and the foul.
Tree Rollins|C|7-1|1984|United States|deep|standard|rim|80|10|0|0|-|def:84,reb:80|Hawks shot-blocker. The 1984 prime.
Darel Carrier|SG|6-3|1970|United States|deep|standard|shooter|79|16|20|0|-|shot:80,ft:84|ABA All-Star shooter with the Colonels.
Mike Newlin|SG|6-5|1978|United States|deep|standard|slasher|79|18|10|0|-|shot:78,ath:78|Rockets scoring guard.
Frank Selvy|SG|6-3|1955|United States|deep|standard|shooter|79|18|8|0|-|shot:78|All-Star in 1955, the first season inside the window.
Willie Anderson|SF|6-7|1990|United States|deep|standard|wing|80|18|16|0|SG|shot:78,ath:80,def:76|Spurs wing. Olympic prime, then the 1990 season.
Avery Johnson|PG|5-11|1999|United States|two-way|two-way|point|79|14|8|0|-|play:84,def:78|The 1999 champion point guard.
Scott Skiles|PG|6-1|1991|United States|two-way|two-way|point|79|16|20|0|-|play:86,shot:74|The 1991 assist prime.
Sherman Douglas|PG|6-0|1992|United States|deep|ten-day|point|78|16|16|0|-|play:82,shot:76|Heat and Celtics point guard. A short seat.
`,
  quon: `
Larry Brown|PG|5-11|1969|United States|star|standard|point|82|18|6|1|-|play:88,def:80,shot:74|ABA All-Star point guard. The playing prime, not the coaching years.
Larry Jones|SG|6-2|1970|United States|star|standard|slasher|83|26|6|1|-|shot:84,ath:80|ABA All-Star scorer. Not the same prime as Jimmy Jones.
Doug Moe|SF|6-5|1970|United States|star|standard|wing|81|22|8|1|-|shot:80,ath:78,play:74|ABA All-Star forward. The playing prime, before the coaching years.
Antonio Davis|PF|6-9|2001|United States|star|standard|post|82|18|4|1|C|reb:84,def:78,shot:76|2001 All-Star. The Raptors prime.
Joe Barry Carroll|C|7-0|1987|United States|star|standard|post|83|22|2|1|-|shot:80,reb:82,def:74|All-Star center. The 1987 Warriors prime.
Mel Hutchins|PF|6-6|1956|United States|starter|standard|post|82|16|4|0|-|reb:84,def:80,shot:76|Four-time All-Star. The 1956 season is the prime inside the window.
Byron Beck|C|6-9|1972|United States|starter|standard|post|80|16|2|0|-|shot:78,reb:80|ABA All-Star. The Denver prime.
Dick Snyder|SG|6-5|1970|United States|starter|standard|shooter|80|18|12|0|-|shot:80,play:74|All-Star guard. The Seattle prime.
Red Robbins|PF|6-8|1972|United States|rotation|standard|post|80|16|4|0|-|shot:78,reb:78|ABA All-Star forward.
George Johnson|C|6-11|1978|United States|rotation|standard|rim|79|10|0|0|-|def:86,reb:80|The Warriors shot-blocker. Not a different George Johnson.
Jim Chones|C|6-11|1976|United States|rotation|standard|post|79|14|2|0|-|shot:76,reb:78|Cavaliers center on the 1976 side.
Gene Conley|C|6-8|1955|United States|rotation|standard|post|79|14|2|0|-|reb:78,shot:74|All-Star in 1955, inside the window.
Woody Sauldsberry|PF|6-7|1958|United States|rotation|standard|post|80|16|4|0|-|shot:78,reb:78|Rookie of the year and an All-Star in 1958.
Larry Smith|PF|6-8|1986|United States|deep|standard|rim|79|14|0|0|-|reb:86,def:78|Warriors glass. The 1986 prime.
David Greenwood|PF|6-9|1983|United States|deep|standard|post|79|14|4|0|-|reb:80,def:76|Bulls forward of the early 1980s.
Rodney McCray|SF|6-7|1988|United States|deep|standard|glue|78|14|12|0|-|def:78,play:74|Rockets and Kings wing.
Jay Vincent|SF|6-7|1983|United States|deep|standard|slasher|79|18|8|0|PF|shot:78|Mavericks scoring forward.
Steve Hawes|C|6-9|1978|United States|deep|standard|post|78|14|4|0|PF|play:74,reb:76|Hawks passing big.
Cincy Powell|PF|6-7|1971|United States|deep|standard|wing|78|16|6|0|SF|shot:76,ath:78|ABA forward.
Len Elmore|C|6-10|1976|United States|two-way|two-way|post|78|12|2|0|-|reb:78,def:76|Pacers and Nets center.
Darnell Hillman|PF|6-9|1976|United States|two-way|two-way|rim|78|12|2|0|-|ath:84,reb:76|ABA athlete. The dunk was the calling card.
John Paxson|SG|6-2|1993|United States|deep|ten-day|shooter|77|12|36|0|-|three:78,shot:76|Bulls shooter. A short seat under the stars.
`,
  apse: `
Ty Lawson|PG|5-11|2013|United States|star|standard|point|81|22|28|1|-|play:86,ath:86,shot:78|The 2013 Nuggets prime, before the years after it.
Dick Garmaker|SG|6-3|1957|United States|star|standard|shooter|82|22|8|1|-|shot:82,ft:82|Four-time All-Star. The Minneapolis prime inside the window.
Eddie Johnson|SF|6-7|1989|United States|star|standard|shooter|82|22|28|1|SG|shot:82,three:78,ath:78|Hawks sixth man of the year in 1989. Not the Kings guard of the same name.
Keith Van Horn|PF|6-10|2001|United States|star|standard|stretch|81|22|32|1|SF|shot:78,three:76,reb:74|The 2001 Nets scoring prime.
Rony Seikaly|C|6-11|1992|United States|star|standard|post|81|20|2|1|-|shot:78,reb:84,def:74|Heat center. The 1992 glass season.
Wesley Matthews|SG|6-5|2015|United States|starter|standard|defender|81|16|40|0|SF|three:82,def:80,shot:76|The 2015 two-way wing prime.
Lionel Simmons|SF|6-7|1991|United States|starter|standard|wing|80|20|16|0|-|shot:78,reb:74,play:72|Kings forward. The early-1990s prime.
LaPhonso Ellis|PF|6-8|1994|United States|starter|standard|post|80|18|12|0|-|shot:78,reb:76,def:74|The 1994 Nuggets prime, not the years after the injuries.
Robert Reid|SF|6-8|1981|United States|rotation|standard|wing|80|16|12|0|-|shot:78,def:76,play:74|Rockets forward beside the stars.
John Long|SG|6-5|1983|United States|rotation|standard|slasher|80|18|10|0|-|shot:80,ath:78|Pistons scoring guard. The early-1980s prime.
Mike Dunleavy|SG|6-3|1983|United States|rotation|standard|shooter|80|18|20|0|PG|shot:78,play:76|The playing prime, before the coaching years.
Bonzi Wells|SF|6-5|2003|United States|rotation|standard|slasher|80|20|16|0|SG|ath:84,shot:78|The 2003 scoring prime.
Ryan Anderson|PF|6-10|2012|United States|rotation|standard|stretch|80|16|44|0|-|three:84,shot:74,reb:72|The 2012 stretch prime.
Donyell Marshall|PF|6-9|2004|United States|deep|standard|stretch|79|16|32|0|C|three:76,reb:76|The 2004 stretch season.
Drew Gooden|PF|6-10|2008|United States|deep|standard|post|79|16|8|0|C|reb:80,shot:76|The 2008 counting prime.
Elden Campbell|C|6-11|1997|United States|deep|standard|post|80|16|2|0|-|shot:76,reb:76,def:74|Lakers and Hornets center.
Robin Lopez|C|7-0|2016|United States|deep|standard|rim|79|12|4|0|-|reb:78,def:78|The 2016 rim season.
Bingo Smith|SF|6-5|1975|United States|deep|standard|shooter|79|16|16|0|SG|shot:78|Cavaliers wing of the mid-1970s.
Bob Gross|SF|6-6|1977|United States|deep|standard|wing|79|14|12|0|-|def:78,ath:78|Blazers champion wing.
Vinny Del Negro|PG|6-4|1996|United States|two-way|two-way|point|77|14|28|0|-|play:76,three:74|Spurs and Clippers guard.
Mario Elie|SF|6-5|1995|United States|two-way|two-way|wing|77|12|36|0|SG|def:78,three:76|Champion wing. A two-way seat.
Joe Kleine|C|6-11|1991|United States|deep|ten-day|post|77|12|2|0|-|reb:76,def:74|Kings and Celtics center. A short seat.
`,
  spir: `
Johnny Moore|PG|6-1|1982|United States|star|standard|point|82|16|8|1|-|play:88,def:76,shot:74|Spurs point guard. The 1982 assist prime.
Bob Verga|SG|6-1|1968|United States|star|standard|slasher|82|28|8|1|-|shot:84,ath:80|ABA scoring guard. The Carolina prime.
John Brisker|SF|6-5|1972|United States|star|standard|slasher|81|24|8|1|-|shot:82,ath:82,def:72|ABA scorer. The 1972 prime.
Jayson Williams|PF|6-10|1998|United States|star|standard|rim|80|14|0|1|-|reb:88,def:78,shot:72|Nets glass. The 1998 prime, before the injury.
Elmore Smith|C|7-0|1974|United States|star|standard|rim|81|14|0|1|-|def:88,reb:84,shot:70|Blocks leader. The 1974 Lakers prime.
Ricky Sobers|PG|6-3|1978|United States|starter|standard|slasher|79|18|10|0|-|shot:78,ath:80,play:74|Suns and Pacers guard.
Levern Tart|SG|6-2|1970|United States|starter|standard|slasher|79|22|8|0|-|shot:80,ath:80|ABA scoring guard.
Terry Mills|PF|6-10|1996|United States|starter|standard|stretch|79|16|28|0|-|three:76,shot:74,reb:72|Pistons stretch forward. The 1996 prime.
Anthony Peeler|SG|6-4|1996|United States|rotation|standard|shooter|79|16|32|0|-|ath:82,three:76|Lakers and Timberwolves guard.
Albert King|SF|6-6|1984|United States|rotation|standard|wing|79|18|12|0|-|shot:78,ath:80|Nets forward. Not the same prime as Bernard King.
P.J. Tucker|SF|6-5|2021|United States|rotation|standard|defender|79|12|40|0|PF|def:82,three:78,reb:72|The 2021 corner-and-defense prime.
Udonis Haslem|PF|6-8|2006|United States|rotation|standard|post|78|12|8|0|-|def:80,reb:78,shot:74|Heat forward. The 2006 prime.
Chris Morris|SF|6-8|1992|United States|rotation|standard|slasher|78|16|16|0|-|ath:82,shot:76|Nets wing of the early 1990s.
Dale Davis|PF|6-11|1999|United States|rotation|standard|rim|83|14|0|0|-|shot:70,reb:90,def:82,ft:58,ath:74|Indiana starter and the 2000 All-Star. A rebounder who finished inside, not a deep-bench scorer. Not Antonio Davis.
Bryant Reeves|C|7-0|1998|United States|deep|standard|post|78|16|2|0|-|shot:76,reb:80|Big Country. The Grizzlies prime, not the years after the body gave out.
Grant Long|PF|6-9|1992|United States|deep|standard|glue|78|14|12|0|-|reb:76,def:76|Heat and Bucks forward.
Loy Vaught|PF|6-9|1995|United States|deep|standard|rim|78|14|4|0|-|reb:84,def:74|Clippers glass. The 1995 prime.
George Lynch|SF|6-8|1997|United States|deep|standard|defender|78|12|16|0|PF|def:80,reb:74|The 1997 defensive wing prime.
Bryon Russell|SF|6-7|1998|United States|deep|standard|defender|78|12|32|0|-|def:82,ath:78,three:72|Jazz wing. The 1998 prime.
Lindsey Hunter|PG|6-2|2004|United States|two-way|two-way|defender|78|12|32|0|-|def:82,ath:78|Defensive guard. The 2004 prime.
Billy Keller|SG|5-10|1973|United States|two-way|two-way|shooter|78|14|20|0|-|shot:78,ft:84|ABA shooter on the Pacers champions.
Kent Benson|C|6-10|1981|United States|deep|ten-day|post|77|12|2|0|-|reb:76,def:74|Bucks center. A short seat.
`,
  trns: `
Rickey Green|PG|6-2|1984|United States|star|standard|point|84|22|12|1|-|play:88,shot:80,ath:84,ft:84|All-Star point guard in 1984.
John Johnson|SF|6-7|1972|United States|star|standard|wing|84|22|8|1|PF|shot:80,play:82,reb:74|Seattle forward. All-Star in 1971 and 1972.
Herb Williams|C|6-10|1986|United States|star|standard|post|84|24|4|1|PF|shot:80,reb:84,def:80|The 1986 scoring prime, about 20 a night.
Rex Chapman|SG|6-4|1994|United States|star|standard|shooter|83|26|28|1|-|shot:82,ath:84,ft:82|The Charlotte scoring prime.
Charles Smith|PF|6-10|1992|United States|star|standard|post|83|24|8|1|-|shot:82,ath:80,reb:76|Clippers forward. The 1992 scoring prime, before the Knicks years.
Derek Smith|SG|6-6|1985|United States|starter|standard|slasher|83|26|8|0|SF|shot:84,ath:84|The 1985 Clippers scoring prime, before the knee.
Mike Gminski|C|6-11|1985|United States|starter|standard|post|82|20|4|0|-|shot:80,reb:82,def:74|Nets center. The mid-1980s prime.
Johnny Dawkins|PG|6-2|1987|United States|starter|standard|point|82|22|16|0|-|play:84,shot:78,ath:82|Spurs point guard. The 1987 prime.
Greg Ballard|SF|6-7|1982|United States|starter|standard|wing|82|22|8|0|PF|shot:80,reb:80|Bullets forward. The 1982 prime, about 18 and 8.
Lewis Lloyd|SG|6-6|1986|United States|starter|standard|slasher|82|26|10|0|-|shot:82,ath:84|Rockets scoring guard. The 1986 prime.
Kermit Washington|PF|6-8|1978|United States|rotation|standard|post|82|16|2|0|-|reb:88,def:84,shot:74|All-defense rebounder. The 1978 prime.
Dave Robisch|C|6-10|1976|United States|rotation|standard|post|81|18|4|0|PF|shot:78,reb:82|ABA and NBA double-double big. The 1976 prime.
Kurt Thomas|PF|6-9|2001|United States|rotation|standard|post|81|16|6|0|C|reb:84,def:80,shot:74|Knicks glass. The 2001 prime.
Ron Anderson|SF|6-7|1989|United States|rotation|standard|wing|80|20|12|0|-|shot:80,ath:78|Sixers scoring forward. The 1989 prime.
Kevin Grevey|SG|6-5|1978|United States|rotation|standard|shooter|80|20|10|0|SF|shot:80,ft:82|Bullets guard. The 1978 prime.
Walter Dukes|C|7-0|1958|United States|deep|standard|post|80|16|0|0|-|reb:88,def:74,shot:72|Rebounder. The 1958 prime is inside the window.
Jim Brewer|PF|6-9|1976|United States|deep|standard|defender|79|12|2|0|C|def:82,reb:80|Cavaliers forward. The 1976 prime.
Leroy Ellis|C|6-10|1969|United States|deep|standard|post|79|14|2|0|-|reb:80,shot:74|Lakers and Bullets center. The late-1960s prime.
Mark Olberding|SF|6-9|1979|United States|deep|standard|wing|80|16|6|0|PF|shot:78,reb:76|Spurs forward. The 1979 prime.
Allen Leavell|PG|6-1|1983|United States|two-way|two-way|point|79|16|12|0|-|play:82,ath:80|Rockets point guard. A two-way seat.
Wayne Cooper|C|6-10|1986|United States|two-way|two-way|rim|79|12|0|0|-|reb:80,def:80|Nuggets center. A two-way seat.
Mitchell Wiggins|SG|6-4|1986|United States|deep|ten-day|wing|78|18|16|0|-|shot:78,ath:80|Rockets wing. A short seat.
`,
  cler: `
Brandin Podziemski|SG|6-5|2025|United States|star|standard|wing|84|22|36|1|PG|play:82,shot:80,def:78,reb:74|The 2025 two-way guard prime already on record.
Payton Pritchard|PG|6-1|2025|United States|star|standard|point|83|22|42|1|-|three:88,shot:82,play:80|Sixth Man prime already on record. The lead guard of this house.
Christian Braun|SG|6-6|2025|United States|star|standard|wing|83|22|34|1|SF|shot:82,ath:84,def:78|The 2025 starter prime already on record.
Seth Curry|SG|6-2|2021|United States|star|standard|shooter|82|20|48|1|-|three:90,shot:84,ft:86|The 2021 shooting prime.
Dorian Finney-Smith|SF|6-7|2022|United States|star|standard|wing|82|16|40|1|PF|def:82,three:80,reb:72|The 2022 corner-and-defense prime.
Markelle Fultz|PG|6-4|2024|United States|starter|standard|point|82|20|28|0|-|play:84,ath:82,def:76|The 2024 Magic prime already on record.
Max Strus|SF|6-5|2023|United States|starter|standard|shooter|81|18|44|0|SG|three:86,shot:78|The 2023 shooting prime.
Larry Nance Jr.|PF|6-8|2022|United States|starter|standard|glue|81|16|12|0|C|def:80,reb:80,ath:82,shot:74,three:58|Athlete and connector. Some threes, not a stretch post.
Malik Beasley|SG|6-4|2024|United States|starter|standard|shooter|81|22|44|0|-|three:86,shot:80|The 2024 scoring guard prime.
De'Anthony Melton|SG|6-2|2023|United States|starter|standard|defender|81|16|38|0|PG|def:86,ath:82,three:78|The 2023 defensive guard prime.
Caleb Martin|SF|6-5|2023|United States|rotation|standard|wing|81|18|36|0|SG|def:80,ath:84,three:76|The 2023 two-way wing prime.
Royce O'Neale|SF|6-6|2022|United States|rotation|standard|wing|80|14|40|0|PF|def:80,three:80,reb:72|The 2022 corner forward prime.
Miles McBride|PG|6-1|2025|United States|rotation|standard|point|80|16|40|0|-|def:82,three:82,play:76|The 2025 backup-guard prime already on record.
Haywood Highsmith|SF|6-7|2024|United States|deep|standard|defender|79|12|38|0|PF|def:82,ath:80,three:76|The 2024 defensive wing prime.
Julian Champagnie|SF|6-7|2025|United States|deep|standard|shooter|80|16|42|0|-|three:84,shot:78|The 2025 shooting prime already on record.
Jaylin Williams|PF|6-9|2025|United States|deep|standard|post|80|12|28|0|C|def:82,reb:80,three:74|Oklahoma City forward. The 2025 prime already on record. Not Jalen Williams.
Kevon Looney|C|6-9|2022|United States|deep|standard|rim|80|12|4|0|PF|reb:84,def:80,shot:74|The 2022 glass prime.
Gary Payton II|SG|6-3|2022|United States|deep|standard|defender|80|12|36|0|SF|def:88,ath:86|The 2022 defensive guard prime.
Moses Moody|SG|6-5|2024|United States|deep|standard|wing|79|14|38|0|SF|def:78,three:78,ath:80|The 2024 wing prime already on record.
Josh Richardson|SG|6-5|2021|United States|two-way|two-way|wing|79|16|36|0|SF|def:80,three:76|The 2021 two-way guard prime.
Nick Richards|C|7-0|2024|United States|two-way|two-way|rim|78|14|0|0|-|reb:80,def:78,ath:80|The 2024 rim prime. A two-way seat.
Cody Zeller|C|6-11|2019|United States|deep|ten-day|post|78|14|8|0|-|reb:78,shot:74|The 2019 center prime. A short seat.
`,
  ambl: `
Derek Fisher|PG|6-1|2009|United States|star|standard|point|81|16|32|1|-|shot:78,three:76,def:78,clutch:86|The 2009 closer prime.
Hubert Davis|SG|6-5|1997|United States|star|standard|shooter|80|18|40|1|-|three:84,shot:80,ft:84|Knicks shooter. The 1997 prime.
Jared Dudley|SF|6-7|2016|United States|star|standard|wing|80|14|40|1|PF|three:80,def:76,play:74|The 2016 connector prime.
Brandon Bass|C|6-8|2013|United States|star|standard|post|81|16|4|1|PF|shot:78,reb:78,def:76|Celtics big. The 2013 prime.
Delonte West|SG|6-4|2008|United States|star|standard|wing|80|18|32|1|PG|shot:78,def:78,play:76|The 2008 Cavaliers prime.
Brian Shaw|PG|6-6|1995|United States|starter|standard|point|80|16|28|0|-|play:82,def:76,shot:74|The 1995 connector prime.
Chucky Atkins|PG|5-11|2003|United States|starter|standard|point|79|18|36|0|-|shot:78,three:76,play:76|The 2003 scoring-guard prime.
Travis Best|PG|5-11|2001|United States|starter|standard|point|79|18|30|0|-|play:80,shot:76,ath:80|Pacers point guard. The 2001 prime.
Gerald Henderson|SG|6-2|1985|United States|starter|standard|shooter|80|18|12|0|-|shot:80,def:78|The elder. Celtics and SuperSonics guard. Not Gerald Henderson Jr.
Tony Delk|SG|6-1|2001|United States|starter|standard|shooter|80|20|36|0|PG|shot:80,three:78,ath:78|The 2001 scoring prime.
Antonio Daniels|SG|6-4|2005|United States|rotation|standard|wing|79|16|30|0|PG|play:80,def:76,shot:76|The 2005 connector prime.
Malik Rose|PF|6-7|2004|United States|rotation|standard|post|79|14|8|0|C|reb:78,def:78,shot:74|Spurs forward. The 2004 prime.
Othella Harrington|PF|6-9|2001|United States|rotation|standard|post|78|16|6|0|C|reb:78,shot:76|The 2001 Knicks prime.
Matt Bullard|PF|6-10|1994|United States|rotation|standard|stretch|78|14|40|0|C|three:80,shot:76|Rockets stretch big. The 1994 prime.
Duane Ferrell|SF|6-7|1992|United States|rotation|standard|wing|78|16|16|0|-|shot:78,ath:80|Hawks wing. The 1992 prime.
Foots Walker|PG|6-1|1976|United States|deep|standard|point|78|16|8|0|-|play:80,def:76|James Walker. Cavaliers point guard. The 1976 prime.
Chris Childs|PG|6-3|1998|United States|deep|standard|point|78|14|28|0|-|def:80,play:78,shot:74|Knicks point guard. The 1998 prime.
Steve Blake|PG|6-3|2012|United States|deep|standard|point|78|14|36|0|-|play:80,three:78|The 2012 connector prime.
Greg Anthony|PG|6-0|1995|United States|deep|standard|point|78|16|24|0|-|play:78,def:78,ath:78|Knicks point guard. The 1995 prime.
Charlie Ward|PG|6-2|1999|United States|deep|ten-day|point|77|12|28|0|-|play:78,def:74|Knicks point guard. A short seat.
Reggie Bullock|SF|6-6|2021|United States|two-way|two-way|shooter|78|12|42|0|-|three:82,def:76|The 2021 corner wing. A two-way seat.
Nerlens Noel|C|6-11|2021|United States|two-way|two-way|rim|78|12|0|0|-|def:82,reb:80,ath:82|The 2021 rim prime. A two-way seat.
`,
  kyst: `
T.R. Dunn|SG|6-4|1984|United States|star|standard|defender|80|12|8|1|SF|def:88,ath:80,shot:70|Nuggets stopper. The 1984 prime.
Dwight Jones|PF|6-10|1978|United States|star|standard|post|80|16|4|1|C|reb:82,shot:76,def:76|Hawks and Bulls forward. The 1978 prime.
Kyle Macy|PG|6-3|1982|United States|star|standard|shooter|80|16|24|1|-|shot:80,ft:90,play:78|Suns shooter. The 1982 prime.
Dave Meyers|SF|6-8|1976|United States|star|standard|wing|79|18|8|1|PF|shot:78,reb:76|Bucks forward. The 1976 prime.
Dave Corzine|C|6-11|1985|United States|star|standard|post|79|16|4|1|-|reb:80,shot:74,def:74|Bulls center. The 1985 prime.
Ernie Grunfeld|SG|6-6|1979|United States|starter|standard|wing|79|18|10|0|SF|shot:78,reb:72|The 1979 scoring prime. Represented the United States.
Sonny Parker|SG|6-6|1978|United States|starter|standard|wing|79|16|8|0|SF|shot:78,def:76,ath:78|Warriors wing. The 1978 prime.
Roy Hinson|PF|6-9|1986|United States|starter|standard|post|79|18|6|0|C|shot:78,reb:76,ath:80|Cavaliers forward. The 1986 prime.
Allan Bristow|SF|6-7|1976|United States|starter|standard|wing|79|16|8|0|PF|shot:76,play:76,reb:74|Spurs forward. The 1976 prime.
Darwin Cook|SG|6-3|1984|United States|starter|standard|shooter|78|18|16|0|-|shot:78,ath:78|Nets guard. The 1984 prime.
Mike Evans|SG|6-1|1984|United States|rotation|standard|shooter|78|16|12|0|PG|shot:78,play:74|Nuggets guard. The 1984 prime.
Mike O'Koren|SF|6-7|1983|United States|rotation|standard|wing|78|16|10|0|-|shot:76,ath:78,def:74|Nets forward. The 1983 prime.
Joe Bryant|SF|6-9|1978|United States|rotation|standard|wing|78|18|8|0|PF|shot:78,ath:80|Jellybean Bryant. The 1978 Clippers prime.
Pat Cummings|PF|6-9|1984|United States|rotation|standard|post|78|16|6|0|C|reb:78,shot:74|Knicks and Bucks forward. The 1984 prime.
Cliff Robinson|PF|6-9|1987|United States|rotation|standard|post|78|16|8|0|C|shot:76,reb:76|The 76ers forward. Not Clifford Robinson of the Trail Blazers.
Bob Weiss|PG|6-2|1968|United States|deep|standard|point|78|14|8|0|-|play:80,shot:74|The late-1960s point guard.
Walt Wesley|C|6-11|1970|United States|deep|standard|post|78|14|2|0|-|reb:80,shot:72|Cavaliers center. The 1970 prime.
Quintin Dailey|SG|6-3|1984|United States|deep|standard|slasher|78|20|12|0|-|shot:78,ath:80|Bulls guard. The 1984 prime.
Gene Banks|SF|6-7|1984|United States|deep|standard|wing|78|16|10|0|PF|shot:76,reb:74|Spurs and Bulls forward. The 1984 prime.
Sidney Green|PF|6-9|1986|United States|two-way|two-way|post|78|14|6|0|C|reb:78,shot:74|The 1986 big. A two-way seat.
Stu Lantz|SG|6-3|1973|United States|two-way|two-way|shooter|78|16|10|0|-|shot:78,ath:76|Rockets guard. The 1973 prime. A two-way seat.
Bill Hanzlik|SF|6-7|1986|United States|deep|ten-day|defender|78|10|12|0|SG|def:84,ath:78|Nuggets stopper. A short seat.
`,
};
