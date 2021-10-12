export default function () {
    const text = [
        'Muhammad Ali (born Cassius Marcellus Clay Jr. January 17, 1942 – June 3, 2016) was an American professional boxer, activist, entertainer, poet, and philanthropist. ',
        'Nicknamed The Greatest, he is widely regarded as one of the most significant and celebrated figures of the 20th century, and is frequently ranked as the best heavyweight boxer of all time. ',
        'Ali was born and raised in Louisville, Kentucky. He began training as an amateur boxer at age 12. At 18, he won a gold medal in the light heavyweight division at the 1960 Summer Olympics and turned professional later that year. ',
        'He became a Muslim after 1961. He won the world heavyweight championship from Sonny Liston in a major upset on February 25, 1964, at age 22. ',
        'On March 6, 1964, he announced that he no longer would be known as Cassius Clay but as Muhammad Ali. In 1966, Ali refused to be drafted into the military, citing his religious beliefs and ethical opposition to the Vietnam War. ',
        'He was found guilty of draft evasion so he faced 5 years in prison and was stripped of his boxing titles. He stayed out of prison as he appealed the decision to the Supreme Court, which overturned his conviction in 1971, but he had not fought for nearly four years and lost a period of peak performance as an athlete. ',
        "Ali's actions as a conscientious objector to the Vietnam War made him an icon for the larger counterculture generation, and he was a very high-profile figure of racial pride for African Americans during the civil rights movement and throughout his career. ",
        "As a Muslim, Ali was initially affiliated with Elijah Muhammad's Nation of Islam (NOI). He later disavowed the NOI, adhering to Sunni Islam, and supported racial integration like his former mentor Malcolm X. ",
        "He was involved in several historic boxing matches and feuds, most notably his fights with Joe Frazier, including the Fight of the Century (the biggest boxing event up until then), the Thrilla in Manila, and his fight with George Foreman known as The Rumble in the Jungle, which was watched by a record estimated television audience of 1 billion viewers worldwide,  becoming the world's most-watched live television broadcast at the time. ",
        'Ali thrived in the spotlight at a time when many fighters let their managers do the talking, and he was often provocative and outlandish. He was known for trash-talking, and often free-styled with rhyme schemes and spoken word poetry, anticipating elements of hip hop.',
        'He has been ranked the greatest heavyweight boxer of all time, and as the greatest sportsman of the 20th century by Sports Illustrated and the Sports Personality of the Century by the BBC.',
        'Outside the ring, Ali attained success as a spoken word artist, where he received two Grammy nominations. He also featured as an actor and writer, releasing two autobiographies. ',
        'Ali retired from boxing in 1981 and focused on religion, philanthropy and activism. ',
        "In 1984, he made public his diagnosis of Parkinson's syndrome, which some reports attribute to boxing-related injuries, though he and his specialist physicians disputed this. ",
        'He remained an active public figure globally, but in his later years made fewer public appearances as his condition worsened, and he was cared for by his family. Ali died on June 3, 2016.'
    ]

    const charArray = []
    text.forEach((sentence) => {
        const replaceSpace = sentence.replaceAll(' ', '*')
        charArray.push(...replaceSpace)
    })
    return charArray
}
