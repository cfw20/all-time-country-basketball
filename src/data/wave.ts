import type { Team } from "./types";

/** Four more overflow houses. Real primes the houses above them never minuted. */
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
};
