const canonicalTransliterations: Record<number, string> = {
  1: `Bismillahir-Rahmanir-Rahim
Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bi shay'in min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.`,
  2: `Bismillahir-Rahmanir-Rahim
Qul Huwallahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.`,
  3: `Bismillahir-Rahmanir-Rahim
Qul a'udhu bi Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.`,
  4: `Bismillahir-Rahmanir-Rahim
Qul a'udhu bi Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.`,
  5: `Asbahna wa asbahal-mulku lillah, walhamdu lillah. La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhal-yawm wa khayra ma ba'dah, wa a'udhu bika min sharri ma fi hadhal-yawm wa sharri ma ba'dah. Rabbi a'udhu bika minal-kasali wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr.`,
  6: `Allahumma Anta Rabbi la ilaha illa Ant. Khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't. A'udhu bika min sharri ma sana't. Abu'u laka bini'matika 'alayya wa abu'u bidhanbi, faghfir li, fa innahu la yaghfirudh-dhunuba illa Ant.`,
  7: `Raditu billahi Rabban, wa bil-Islami dinan, wa bi Muhammadin sallallahu 'alayhi wa sallama Nabiyyan.`,
  8: `Allahumma inni asbahtu ushhiduka, wa ushhidu hamalata 'arshik, wa mala'ikataka wa jami'a khalqik, annaka Antallahu la ilaha illa Anta wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.`,
  9: `Allahumma ma asbaha bi min ni'matin aw bi ahadin min khalqik, faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.`,
  10: `Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim.`,
  11: `Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.`,
  12: `Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namutu wa ilaykan-nushur.`,
  13: `Asbahna 'ala fitratil-Islam, wa 'ala kalimatil-ikhlas, wa 'ala dini Nabiyyina Muhammadin sallallahu 'alayhi wa sallam, wa 'ala millati abina Ibrahima hanifan Musliman wa ma kana minal-mushrikin.`,
  14: `SubhanAllahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.`,
  15: `Allahumma 'afini fi badani. Allahumma 'afini fi sam'i. Allahumma 'afini fi basari. La ilaha illa Ant.`,
  16: `Allahumma inni a'udhu bika minal-kufri wal-faqr, wa a'udhu bika min 'adhabil-qabr. La ilaha illa Ant.`,
  17: `Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahummastur 'awrati wa amin raw'ati. Allahummahfadhni min bayni yadayya wa min khalfi, wa 'an yamini wa 'an shimali, wa min fawqi, wa a'udhu bi 'adhamatika an ughtala min tahti.`,
  18: `Ya Hayyu ya Qayyum, birahmatika astaghith. Aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'ayn.`,
  19: `Asbahna wa asbahal-mulku lillahi Rabbil-'alamin. Allahumma inni as'aluka khayra hadhal-yawm: fathahu, wa nasrahu, wa nurahu, wa barakatahu, wa hudahu. Wa a'udhu bika min sharri ma fihi wa sharri ma ba'dah.`,
  20: `Allahumma 'Alimal-ghaybi wash-shahadah, Fatiras-samawati wal-ard, Rabba kulli shay'in wa malikah. Ashhadu an la ilaha illa Ant. A'udhu bika min sharri nafsi wa min sharrish-shaytani wa shirkih, wa an aqtarifa 'ala nafsi su'an aw ajurrahu ila Muslim.`,
  21: `A'udhu bikalimatillahit-tammati min sharri ma khalaq.`,
  22: `Allahumma salli wa sallim wa barik 'ala Nabiyyina Muhammad.`,
  23: `Allahumma inna na'udhu bika min an nushrika bika shay'an na'lamuh, wa nastaghfiruka lima la na'lamuh.`,
  24: `Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal.`,
  25: `Astaghfirullahal-'Adhim alladhi la ilaha illa Huwal-Hayyul-Qayyum, wa atubu ilayh.`,
  26: `Ya Rabbi, lakal-hamdu kama yanbaghi lijalali wajhika wa li'adhimi sultanik.`,
  27: `Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.`,
  28: `Allahumma Anta Rabbi la ilaha illa Ant. 'Alayka tawakkaltu wa Anta Rabbul-'Arshil-'Adhim. Ma sha'Allahu kana, wa ma lam yasha' lam yakun. Wa la hawla wa la quwwata illa billahil-'Aliyyil-'Adhim. A'lamu annAllaha 'ala kulli shay'in qadir, wa annAllaha qad ahata bikulli shay'in 'ilma. Allahumma inni a'udhu bika min sharri nafsi, wa min sharri kulli dabbatin Anta akhidhun binasiyatiha. Inna Rabbi 'ala siratin mustaqim.`,
  29: `La ilaha illallahu wahdahu la sharika lah. Lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in qadir.`,
  30: `SubhanAllahi wa bihamdih.`,
  31: `Astaghfirullaha wa atubu ilayh.`,
  102: `Bismillahir-Rahmanir-Rahim
Amanar-rasulu bima unzila ilayhi mir-Rabbihi wal-mu'minun. Kullun amana billahi wa mala'ikatihi wa kutubihi wa rusulih. La nufarriqu bayna ahadin mir-rusulih. Wa qalu sami'na wa ata'na, ghufranaka Rabbana wa ilaykal-masir.
La yukallifullahu nafsan illa wus'aha. Laha ma kasabat wa 'alayha maktasabat. Rabbana la tu'akhidhna in nasina aw akhta'na. Rabbana wa la tahmil 'alayna isran kama hamaltahu 'alal-ladhina min qablina. Rabbana wa la tuhammilna ma la taqata lana bih. Wa'fu 'anna, waghfir lana, warhamna. Anta Mawlana fansurna 'alal-qawmil-kafirin.`,
  106: `Amsayna wa amsal-mulku lillah, walhamdu lillah. La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhihil-laylati wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylati wa sharri ma ba'daha. Rabbi a'udhu bika minal-kasali wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr.`,
  109: `Allahumma inni amsaytu ushhiduka, wa ushhidu hamalata 'arshik, wa mala'ikataka wa jami'a khalqik, annaka Antallahu la ilaha illa Anta wahdaka la sharika lak, wa anna Muhammadan 'abduka wa rasuluk.`,
  110: `Allahumma ma amsa bi min ni'matin aw bi ahadin min khalqik, faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr.`,
  113: `Allahumma bika amsayna wa bika asbahna, wa bika nahya wa bika namutu wa ilaykal-masir.`,
  114: `Amsayna 'ala fitratil-Islam, wa 'ala kalimatil-ikhlas, wa 'ala dini Nabiyyina Muhammadin sallallahu 'alayhi wa sallam, wa 'ala millati abina Ibrahima hanifan Musliman wa ma kana minal-mushrikin.`,
  118: `Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahummastur 'awrati wa amin raw'ati. Allahummahfadhni min bayni yadayya wa min khalfi, wa 'an yamini wa 'an shimali, wa min fawqi, wa a'udhu bi 'adhamatika an ughtala min tahti.`,
  120: `Amsayna wa amsal-mulku lillahi Rabbil-'alamin. Allahumma inni as'aluka khayra hadhihil-laylah: fathaha, wa nasraha, wa nuraha, wa barakataha, wa hudaha. Wa a'udhu bika min sharri ma fiha wa sharri ma ba'daha.`,
};

const aliases: Record<number, number> = {
  101: 1,
  103: 2,
  104: 3,
  105: 4,
  107: 6,
  108: 7,
  111: 10,
  112: 11,
  115: 14,
  116: 15,
  117: 16,
  119: 18,
  121: 20,
  122: 21,
  123: 22,
  124: 23,
  125: 24,
  126: 25,
  127: 26,
  128: 29,
  129: 28,
  130: 30,
};

export function getBuiltInTransliteration(id: number): string | undefined {
  return canonicalTransliterations[aliases[id] ?? id];
}
