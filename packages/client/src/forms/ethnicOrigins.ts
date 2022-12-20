/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { ISelectOption } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'

export const ETHNIC_ORIGINS: ISelectOption[] = [
  { value: 'ABUA', label: formMessageDescriptors.abua },
  {
    value: 'ADRA_ADARAWA',
    label: formMessageDescriptors.adraAdarawa
  },
  { value: 'ADUN', label: formMessageDescriptors.adun },
  { value: 'AFCABEYA', label: formMessageDescriptors.afcabeya },
  { value: 'AFEMAI', label: formMessageDescriptors.afemai },
  { value: 'AFIZIRE', label: formMessageDescriptors.afizire },
  { value: 'AGATU', label: formMessageDescriptors.agatu },
  { value: 'AGBASSA', label: formMessageDescriptors.agbassa },
  { value: 'AGBOR', label: formMessageDescriptors.agbor },
  { value: 'AFO', label: formMessageDescriptors.afo },
  { value: 'AJOWA', label: formMessageDescriptors.ajowa },
  { value: 'AKPA', label: formMessageDescriptors.akpa },
  { value: 'AKWAI', label: formMessageDescriptors.akwai },
  { value: 'AKYE', label: formMessageDescriptors.akye },
  { value: 'ALAGO', label: formMessageDescriptors.alago },
  { value: 'AMAMONG', label: formMessageDescriptors.amamong },
  { value: 'AMO', label: formMessageDescriptors.amo },
  { value: 'ANA', label: formMessageDescriptors.ana },
  { value: 'ANAGUTA', label: formMessageDescriptors.anaguta },
  { value: 'ANKWAI', label: formMessageDescriptors.ankwai },
  { value: 'ANNANG', label: formMessageDescriptors.annang },
  { value: 'ARAB', label: formMessageDescriptors.arab },
  { value: 'ARABO', label: formMessageDescriptors.arabo },
  { value: 'ARBAR', label: formMessageDescriptors.arbar },
  { value: 'ARUGU', label: formMessageDescriptors.arugu },
  {
    value: 'ATEN_ATAM',
    label: formMessageDescriptors.atenAtam
  },
  { value: 'ATTAKAR', label: formMessageDescriptors.attakar },
  { value: 'AUCHI', label: formMessageDescriptors.auchi },
  {
    value: 'AULLIMINDEN',
    label: formMessageDescriptors.aulliminden
  },
  { value: 'AWO', label: formMessageDescriptors.awo },
  {
    value: 'AYETORO_GBEDE',
    label: formMessageDescriptors.ayetoroGbede
  },
  { value: 'BADARARE', label: formMessageDescriptors.badarare },
  {
    value: 'BADE_BADAWE',
    label: formMessageDescriptors.badeBadawe
  },
  { value: 'BAFEKE', label: formMessageDescriptors.bafeke },
  {
    value: 'BAGATHIYA',
    label: formMessageDescriptors.bagathiya
  },
  { value: 'BAGGARA', label: formMessageDescriptors.baggara },
  {
    value: 'BAGUNGE_BADAGIRE',
    label: formMessageDescriptors.bagungeBadagire
  },
  { value: 'BAHNAKE', label: formMessageDescriptors.bahnake },
  {
    value: 'BAJI_BIJI',
    label: formMessageDescriptors.bajiBiji
  },
  { value: 'BAJJU', label: formMessageDescriptors.bajju },
  { value: 'BAMBARO', label: formMessageDescriptors.bambaro },
  { value: 'BAMBUKA', label: formMessageDescriptors.bambuka },
  { value: 'BANDAWA', label: formMessageDescriptors.bandawa },
  { value: 'BANGUJI', label: formMessageDescriptors.banguji },
  {
    value: 'BANKALAWA',
    label: formMessageDescriptors.bankalawa
  },
  { value: 'BCHAMA', label: formMessageDescriptors.bchama },
  { value: 'BARABACI', label: formMessageDescriptors.barabaci },
  { value: 'BARAWA', label: formMessageDescriptors.barawa },
  { value: 'BARGAWA', label: formMessageDescriptors.bargawa },
  { value: 'BASSA', label: formMessageDescriptors.bassa },
  { value: 'BEKWORAS', label: formMessageDescriptors.bekworas },
  { value: 'BEROM', label: formMessageDescriptors.berom },
  { value: 'BINI_EDO', label: formMessageDescriptors.biniEdo },
  { value: 'BOGOM', label: formMessageDescriptors.bogom },
  {
    value: 'BOIYAWA_BOZAYA',
    label: formMessageDescriptors.boiyawaBozaya
  },
  {
    value: 'BOLAWA_BOLEWA',
    label: formMessageDescriptors.bolawaBolewa
  },
  { value: 'BUDUMA', label: formMessageDescriptors.buduma },
  { value: 'BUKO', label: formMessageDescriptors.buko },
  {
    value: 'BURA_BABUR',
    label: formMessageDescriptors.buraBabur
  },
  { value: 'BUZU', label: formMessageDescriptors.buzu },
  { value: 'BYAZHI', label: formMessageDescriptors.byazhi },
  { value: 'CALABAR', label: formMessageDescriptors.calabar },
  { value: 'CHALA', label: formMessageDescriptors.chala },
  { value: 'CHAMBA', label: formMessageDescriptors.chamba },
  { value: 'CHIBA', label: formMessageDescriptors.chiba },
  { value: 'CHIBOK_G', label: formMessageDescriptors.chibokG },
  { value: 'CHIP', label: formMessageDescriptors.chip },
  { value: 'DADIYA', label: formMessageDescriptors.dadiya },
  {
    value: 'BADAKARE_DAKARKARI',
    label: formMessageDescriptors.badakareDakarkari
  },
  {
    value: 'DAKKA_DOKA',
    label: formMessageDescriptors.dakkaDoka
  },
  { value: 'DANGULA', label: formMessageDescriptors.dangula },
  {
    value: 'DAURAWA_DAGARAWA',
    label: formMessageDescriptors.daurawaDagarawa
  },
  { value: 'DEFAKA', label: formMessageDescriptors.defaka },
  { value: 'DEGIMA', label: formMessageDescriptors.degima },
  {
    value: 'DELTA_IBO',
    label: formMessageDescriptors.deltaIbo
  },
  { value: 'DIBO', label: formMessageDescriptors.dibo },
  { value: 'DIGUZA', label: formMessageDescriptors.diguza },
  { value: 'DJERMA', label: formMessageDescriptors.djerma },
  { value: 'DMOKO', label: formMessageDescriptors.dmoko },
  { value: 'DOLCHI', label: formMessageDescriptors.dolchi },
  {
    value: 'EBIRA_IGBIRA',
    label: formMessageDescriptors.ebiraIgbira
  },
  { value: 'EBU', label: formMessageDescriptors.ebu },
  { value: 'EFIK', label: formMessageDescriptors.efik },
  { value: 'EGBA', label: formMessageDescriptors.egba },
  { value: 'EGBADO', label: formMessageDescriptors.egbado },
  { value: 'EGGON', label: formMessageDescriptors.eggon },
  { value: 'EGUN', label: formMessageDescriptors.egun },
  { value: 'EKET', label: formMessageDescriptors.eket },
  { value: 'EKOI', label: formMessageDescriptors.ekoi },
  {
    value: 'EKPEYE_AFISA_EPIE',
    label: formMessageDescriptors.ekpeyeAfisaEpie
  },
  { value: 'EKULU', label: formMessageDescriptors.ekulu },
  { value: 'ELEME', label: formMessageDescriptors.eleme },
  { value: 'EMU', label: formMessageDescriptors.emu },
  { value: 'ESAN', label: formMessageDescriptors.esan },
  { value: 'ETINA', label: formMessageDescriptors.etina },
  { value: 'ETSAKO', label: formMessageDescriptors.etsako },
  { value: 'ETULO', label: formMessageDescriptors.etulo },
  { value: 'HADEJAWA', label: formMessageDescriptors.hadejawa },
  { value: 'FANSO', label: formMessageDescriptors.fanso },
  { value: 'FEMAWA', label: formMessageDescriptors.femawa },
  { value: 'FER', label: formMessageDescriptors.fer },
  {
    value: 'FILIYA_FALI',
    label: formMessageDescriptors.filiyaFali
  },
  { value: 'FON', label: formMessageDescriptors.fon },
  { value: 'FORON', label: formMessageDescriptors.foron },
  { value: 'FRENCH', label: formMessageDescriptors.french },
  { value: 'FULANI', label: formMessageDescriptors.fulani },
  { value: 'GAMAKU', label: formMessageDescriptors.gamaku },
  { value: 'GAMARU', label: formMessageDescriptors.gamaru },
  { value: 'GAMUNI', label: formMessageDescriptors.gamuni },
  {
    value: 'GANA_GANA',
    label: formMessageDescriptors.ganaGana
  },
  { value: 'GANAWURI', label: formMessageDescriptors.ganawuri },
  {
    value: 'GBAJU_GBAGI',
    label: formMessageDescriptors.gbajuGbagi
  },
  {
    value: 'GEDE_GUDE_GAI',
    label: formMessageDescriptors.gedeGudeGai
  },
  { value: 'GERAWA', label: formMessageDescriptors.gerawa },
  { value: 'GIZMAWA', label: formMessageDescriptors.gizmawa },
  { value: 'GLAUDA', label: formMessageDescriptors.glauda },
  { value: 'GMENCHI', label: formMessageDescriptors.gmenchi },
  {
    value: 'GOMO_GAMOYAYA',
    label: formMessageDescriptors.gomoGamoyaya
  },
  {
    value: 'GOBIRI_GOBIRAWA_BOGOBIRI',
    label: formMessageDescriptors.gobiriGobirawaBogobiri
  },
  {
    value: 'GUJJURAWA',
    label: formMessageDescriptors.gujjurawa
  },
  { value: 'GUEMAI', label: formMessageDescriptors.guemai },
  {
    value: 'GUMBARAWA',
    label: formMessageDescriptors.gumbarawa
  },
  {
    value: 'GUNGANCHI',
    label: formMessageDescriptors.gunganchi
  },
  { value: 'GWANDARA', label: formMessageDescriptors.gwandara },
  { value: 'GWANTU', label: formMessageDescriptors.gwantu },
  { value: 'HANKWE', label: formMessageDescriptors.hankwe },
  { value: 'HAUSA', label: formMessageDescriptors.hausa },
  { value: 'HIGGI', label: formMessageDescriptors.higgi },
  { value: 'IBARIBA', label: formMessageDescriptors.ibariba },
  { value: 'IBIBIO', label: formMessageDescriptors.ibibio },
  { value: 'ICHEN', label: formMessageDescriptors.ichen },
  { value: 'IDANRE', label: formMessageDescriptors.idanre },
  { value: 'IDOMA', label: formMessageDescriptors.idoma },
  { value: 'IGALA', label: formMessageDescriptors.igala },
  { value: 'IGBO_IBO', label: formMessageDescriptors.igboIbo },
  { value: 'IGEDE', label: formMessageDescriptors.igede },
  {
    value: 'IJAW_IZON',
    label: formMessageDescriptors.ijawIzon
  },
  { value: 'IJEDE', label: formMessageDescriptors.ijede },
  { value: 'IJEME', label: formMessageDescriptors.ijeme },
  { value: 'IKA', label: formMessageDescriptors.ika },
  { value: 'IKAJO', label: formMessageDescriptors.ikajo },
  { value: 'IKARA', label: formMessageDescriptors.ikara },
  { value: 'IKPESHI', label: formMessageDescriptors.ikpeshi },
  { value: 'IKPIDE', label: formMessageDescriptors.ikpide },
  { value: 'IKULU', label: formMessageDescriptors.ikulu },
  { value: 'IKWERE', label: formMessageDescriptors.ikwere },
  { value: 'ILAJE', label: formMessageDescriptors.ilaje },
  { value: 'IRIGWE', label: formMessageDescriptors.irigwe },
  { value: 'ISHAN', label: formMessageDescriptors.ishan },
  { value: 'ISOKO', label: formMessageDescriptors.isoko },
  { value: 'ITSEKIRI', label: formMessageDescriptors.itsekiri },
  { value: 'JABA', label: formMessageDescriptors.jaba },
  { value: 'JAJIRI', label: formMessageDescriptors.jajiri },
  { value: 'JAKATOE', label: formMessageDescriptors.jakatoe },
  { value: 'JAKU', label: formMessageDescriptors.jaku },
  { value: 'JARA', label: formMessageDescriptors.jara },
  { value: 'JARAWA', label: formMessageDescriptors.jarawa },
  { value: 'JIBU', label: formMessageDescriptors.jibu },
  { value: 'JONJO', label: formMessageDescriptors.jonjo },
  { value: 'JUKUN', label: formMessageDescriptors.jukun },
  { value: 'KABAWA', label: formMessageDescriptors.kabawa },
  { value: 'KADARA', label: formMessageDescriptors.kadara },
  { value: 'KAGOMA', label: formMessageDescriptors.kagoma },
  { value: 'KAGORO', label: formMessageDescriptors.kagoro },
  { value: 'KAKA', label: formMessageDescriptors.kaka },
  { value: 'KAKANDA', label: formMessageDescriptors.kakanda },
  { value: 'KAMANTAM', label: formMessageDescriptors.kamantam },
  { value: 'KAMBARI', label: formMessageDescriptors.kambari },
  {
    value: 'KAMBU_KANGU',
    label: formMessageDescriptors.kambuKangu
  },
  { value: 'KAMUKU', label: formMessageDescriptors.kamuku },
  { value: 'KANAKURU', label: formMessageDescriptors.kanakuru },
  { value: 'KANAWA', label: formMessageDescriptors.kanawa },
  { value: 'KANINKO', label: formMessageDescriptors.kaninko },
  {
    value: 'KANTANAWA',
    label: formMessageDescriptors.kantanawa
  },
  {
    value: 'KANURI_BERIBERI',
    label: formMessageDescriptors.kanuriBeriberi
  },
  { value: 'MANGA', label: formMessageDescriptors.manga },
  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
  {
    value: 'KATAF_ATYAP',
    label: formMessageDescriptors.katafAtyap
  },
  { value: 'KENTO', label: formMessageDescriptors.kento },
  { value: 'KIBAKU', label: formMessageDescriptors.kibaku },
  { value: 'KILBA', label: formMessageDescriptors.kilba },
  { value: 'KIRDI', label: formMessageDescriptors.kirdi },
  { value: 'KODKI', label: formMessageDescriptors.kodki },
  { value: 'KOFYAR', label: formMessageDescriptors.kofyar },
  { value: 'KONA', label: formMessageDescriptors.kona },
  { value: 'KORO', label: formMessageDescriptors.koro },
  { value: 'KOTO', label: formMessageDescriptors.koto },
  { value: 'KUENUEM', label: formMessageDescriptors.kuenuem },
  { value: 'KUMBO', label: formMessageDescriptors.kumbo },
  {
    value: 'KUNKAWA_KAWA',
    label: formMessageDescriptors.kunkawaKawa
  },
  { value: 'KURAMA', label: formMessageDescriptors.kurama },
  { value: 'KUTEB', label: formMessageDescriptors.kuteb },
  { value: 'KUTURM', label: formMessageDescriptors.kuturm },
  {
    value: 'KWALE_UKWUANI',
    label: formMessageDescriptors.kwaleUkwuani
  },
  { value: 'KWANZO', label: formMessageDescriptors.kwanzo },
  { value: 'LAGELU', label: formMessageDescriptors.lagelu },
  { value: 'LANTANG', label: formMessageDescriptors.lantang },
  { value: 'LEMORO', label: formMessageDescriptors.lemoro },
  { value: 'LOH', label: formMessageDescriptors.loh },
  { value: 'LUNGUDA', label: formMessageDescriptors.lunguda },
  {
    value: 'MABA_MBADOWA',
    label: formMessageDescriptors.mabaMbadowa
  },
  { value: 'MADA', label: formMessageDescriptors.mada },
  {
    value: 'MAFA_MAKA_MAGA',
    label: formMessageDescriptors.mafaMakaMaga
  },
  { value: 'MAMBILA', label: formMessageDescriptors.mambila },
  { value: 'MANDARA', label: formMessageDescriptors.mandara },
  {
    value: 'MANGUS_MANJU',
    label: formMessageDescriptors.mangusManju
  },
  {
    value: 'MARGHI_MANGI',
    label: formMessageDescriptors.marghiMangi
  },
  { value: 'MBWA', label: formMessageDescriptors.mbwa },
  { value: 'MINGO', label: formMessageDescriptors.mingo },
  { value: 'MIRNANG', label: formMessageDescriptors.mirnang },
  { value: 'MONTOR', label: formMessageDescriptors.montor },
  {
    value: 'MTCHIGA_MICHIKA',
    label: formMessageDescriptors.mtchigaMichika
  },
  { value: 'MUMUYE', label: formMessageDescriptors.mumuye },
  { value: 'MUNGA', label: formMessageDescriptors.munga },
  { value: 'MUPUNG', label: formMessageDescriptors.mupung },
  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
  { value: 'MWAGAVOL', label: formMessageDescriptors.mwagavol },
  { value: 'NAIAWUM', label: formMessageDescriptors.naiawum },
  { value: 'NAMOEN', label: formMessageDescriptors.namoen },
  { value: 'NDOKWA', label: formMessageDescriptors.ndokwa },
  { value: 'NDOLA', label: formMessageDescriptors.ndola },
  { value: 'NGAMO', label: formMessageDescriptors.ngamo },
  { value: 'UKALE', label: formMessageDescriptors.ukale },
  { value: 'NGOSHE', label: formMessageDescriptors.ngoshe },
  { value: 'NILI', label: formMessageDescriptors.nili },
  { value: 'NINNMA', label: formMessageDescriptors.ninnma },
  { value: 'NINZOM', label: formMessageDescriptors.ninzom },
  { value: 'NKOROO', label: formMessageDescriptors.nkoroo },
  { value: 'NNEBE', label: formMessageDescriptors.nnebe },
  { value: 'NUMANA', label: formMessageDescriptors.numana },
  { value: 'NUNGU', label: formMessageDescriptors.nungu },
  { value: 'NUNKU', label: formMessageDescriptors.nunku },
  { value: 'NUPE', label: formMessageDescriptors.nupe },
  { value: 'OBUBUA', label: formMessageDescriptors.obubua },
  { value: 'ODU', label: formMessageDescriptors.odu },
  { value: 'OGOJA', label: formMessageDescriptors.ogoja },
  { value: 'OGONI', label: formMessageDescriptors.ogoni },
  { value: 'OGUGU', label: formMessageDescriptors.ogugu },
  {
    value: 'OKORI_OGORI',
    label: formMessageDescriptors.okoriOgori
  },
  { value: 'OMELE', label: formMessageDescriptors.omele },
  { value: 'ORA', label: formMessageDescriptors.ora },
  { value: 'ORON', label: formMessageDescriptors.oron },
  { value: 'OWAN', label: formMessageDescriptors.owan },
  { value: 'OWO', label: formMessageDescriptors.owo },
  { value: 'PA_AWA', label: formMessageDescriptors.paAwa },
  { value: 'PABURI', label: formMessageDescriptors.paburi },
  { value: 'PAIBUN', label: formMessageDescriptors.paibun },
  { value: 'PANYA', label: formMessageDescriptors.panya },
  { value: 'PASAMA', label: formMessageDescriptors.pasama },
  { value: 'PERO', label: formMessageDescriptors.pero },
  { value: 'PIYA', label: formMessageDescriptors.piya },
  { value: 'PYEM', label: formMessageDescriptors.pyem },
  { value: 'RUKUBA', label: formMessageDescriptors.rukuba },
  { value: 'RULERE', label: formMessageDescriptors.rulere },
  { value: 'RUNDAWA', label: formMessageDescriptors.rundawa },
  {
    value: 'SAYAWA_SIYAWA',
    label: formMessageDescriptors.sayawaSiyawa
  },
  { value: 'SEKERE', label: formMessageDescriptors.sekere },
  { value: 'SHARAWA', label: formMessageDescriptors.sharawa },
  { value: 'SHOMO', label: formMessageDescriptors.shomo },
  { value: 'SHUWA', label: formMessageDescriptors.shuwa },
  { value: 'SOMUNKA', label: formMessageDescriptors.somunka },
  {
    value: 'SULLUBAWA',
    label: formMessageDescriptors.sullubawa
  },
  { value: 'SURA', label: formMessageDescriptors.sura },
  { value: 'TAIRA', label: formMessageDescriptors.taira },
  { value: 'TANGALE', label: formMessageDescriptors.tangale },
  { value: 'TAROK', label: formMessageDescriptors.tarok },
  { value: 'TERA', label: formMessageDescriptors.tera },
  { value: 'TESKWA', label: formMessageDescriptors.teskwa },
  { value: 'TIGUNI', label: formMessageDescriptors.tiguni },
  { value: 'TIV', label: formMessageDescriptors.tiv },
  { value: 'TIYARI', label: formMessageDescriptors.tiyari },
  { value: 'TULA', label: formMessageDescriptors.tula },
  { value: 'UBAIJA', label: formMessageDescriptors.ubaija },
  { value: 'UGBIA', label: formMessageDescriptors.ugbia },
  {
    value: 'UHIONIGBE',
    label: formMessageDescriptors.uhionigbe
  },
  { value: 'UKWUANI', label: formMessageDescriptors.ukwuani },
  { value: 'URHOBO', label: formMessageDescriptors.urhobo },
  { value: 'UYO', label: formMessageDescriptors.uyo },
  { value: 'UZAURUE', label: formMessageDescriptors.uzaurue },
  { value: 'UZEBA', label: formMessageDescriptors.uzeba },
  { value: 'WAJA', label: formMessageDescriptors.waja },
  { value: 'WAKA', label: formMessageDescriptors.waka },
  { value: 'WANU', label: formMessageDescriptors.wanu },
  { value: 'WARI', label: formMessageDescriptors.wari },
  { value: 'WARJAWA', label: formMessageDescriptors.warjawa },
  { value: 'WODAABE', label: formMessageDescriptors.wodaabe },
  { value: 'WURKUM', label: formMessageDescriptors.wurkum },
  { value: 'YAKURR', label: formMessageDescriptors.yakurr },
  { value: 'YANDANG', label: formMessageDescriptors.yandang },
  { value: 'YENDRE', label: formMessageDescriptors.yendre },
  { value: 'YONUBI', label: formMessageDescriptors.yonubi },
  { value: 'YORUBA', label: formMessageDescriptors.yoruba },
  {
    value: 'ZABARMAWA',
    label: formMessageDescriptors.zabarmawa
  },
  { value: 'KAJE', label: formMessageDescriptors.kaje },
  { value: 'IGBANKO', label: formMessageDescriptors.igbanko },
  {
    value: 'OKORI_OGORI',
    label: formMessageDescriptors.okoriOgori
  },
  { value: 'MIGILI', label: formMessageDescriptors.migili },
  { value: 'GWARI', label: formMessageDescriptors.gwari },
  { value: 'URU', label: formMessageDescriptors.uru },
  { value: 'OKIRIKA', label: formMessageDescriptors.okirika },
  { value: 'EGI', label: formMessageDescriptors.egi },
  { value: 'OGBA', label: formMessageDescriptors.ogba },
  { value: 'MOROA', label: formMessageDescriptors.moroa },
  { value: 'MARWA', label: formMessageDescriptors.marwa },
  { value: 'TOFF', label: formMessageDescriptors.toff },
  { value: 'FULFULDE', label: formMessageDescriptors.fulfulde },
  {
    value: 'KABBA_OKUN',
    label: formMessageDescriptors.kabbaOkun
  },
  { value: 'BAKABE', label: formMessageDescriptors.bakabe },
  { value: 'BURMANCH', label: formMessageDescriptors.burmanch },
  { value: 'KALABARI', label: formMessageDescriptors.kalabari },
  { value: 'MISHIP', label: formMessageDescriptors.miship },
  { value: 'KARIMJO', label: formMessageDescriptors.karimjo },
  { value: 'KWA', label: formMessageDescriptors.kwa },
  { value: 'ANGAS', label: formMessageDescriptors.angas },
  { value: 'BOBARI', label: formMessageDescriptors.bobari },
  { value: 'YARIMAWA', label: formMessageDescriptors.yarimawa },
  { value: 'BAKENGA', label: formMessageDescriptors.bakenga },
  { value: 'AGAZAWA', label: formMessageDescriptors.agazawa },
  { value: 'GWOZA', label: formMessageDescriptors.gwoza },
  { value: 'ZALIDVA', label: formMessageDescriptors.zalidva },
  {
    value: 'NYANGDANG',
    label: formMessageDescriptors.nyangdang
  },
  { value: 'NGEZIM', label: formMessageDescriptors.ngezim },
  { value: 'HANBAGDA', label: formMessageDescriptors.hanbagda },
  { value: 'NJANYI', label: formMessageDescriptors.njanyi },
  { value: 'DUMAK', label: formMessageDescriptors.dumak },
  { value: 'KWALLA', label: formMessageDescriptors.kwalla },
  {
    value: 'YESKWA_AND_MUBULA',
    label: formMessageDescriptors.yeskwaAndMubula
  },
  { value: 'BILE', label: formMessageDescriptors.bile },
  { value: 'OFFA', label: formMessageDescriptors.offa },
  { value: 'YUNGUR', label: formMessageDescriptors.yungur },
  {
    value: 'PURA_PURA',
    label: formMessageDescriptors.puraPura
  },
  { value: 'RINDRE', label: formMessageDescriptors.rindre },
  { value: 'DUKAWA', label: formMessageDescriptors.dukawa },
  { value: 'NINGI', label: formMessageDescriptors.ningi },
  { value: 'CHAM', label: formMessageDescriptors.cham },
  { value: 'KAMO', label: formMessageDescriptors.kamo },
  { value: 'LALA', label: formMessageDescriptors.lala },
  { value: 'LARU', label: formMessageDescriptors.laru },
  { value: 'LISA', label: formMessageDescriptors.lisa },
  { value: 'GAANDA', label: formMessageDescriptors.gaanda },
  { value: 'EZZA', label: formMessageDescriptors.ezza },
  { value: 'KUBASAWA', label: formMessageDescriptors.kubasawa },
  { value: 'GUSU', label: formMessageDescriptors.gusu },
  { value: 'IKPOMA', label: formMessageDescriptors.ikpoma },
  { value: 'BUH', label: formMessageDescriptors.buh },
  { value: 'MUSHERE', label: formMessageDescriptors.mushere },
  { value: 'CHAKEEM', label: formMessageDescriptors.chakeem },
  { value: 'JIPAL', label: formMessageDescriptors.jipal },
  { value: 'UGEB', label: formMessageDescriptors.ugeb },
  { value: 'KOMA', label: formMessageDescriptors.koma },
  {
    value: 'VERRE_KILA',
    label: formMessageDescriptors.verreKila
  },
  { value: 'ZURU', label: formMessageDescriptors.zuru },
  { value: 'HONNA', label: formMessageDescriptors.honna },
  { value: 'KAPSIKI', label: formMessageDescriptors.kapsiki },
  { value: 'JERE', label: formMessageDescriptors.jere },
  {
    value: 'GIZI_YOBE',
    label: formMessageDescriptors.giziYobe
  },
  { value: 'KAREKARE', label: formMessageDescriptors.karekare },
  { value: 'KULERE', label: formMessageDescriptors.kulere },
  { value: 'BETEER', label: formMessageDescriptors.beteer },
  { value: 'BASHAMA', label: formMessageDescriptors.bashama },
  { value: 'ANTOCHA', label: formMessageDescriptors.antocha },
  {
    value: 'BARUBA_BARUNTIN',
    label: formMessageDescriptors.barubaBaruntin
  },
  { value: 'NEZOU', label: formMessageDescriptors.nezou },
  { value: 'DIBBA', label: formMessageDescriptors.dibba },
  { value: 'KANUM', label: formMessageDescriptors.kanum },
  { value: 'GASAWA', label: formMessageDescriptors.gasawa },
  { value: 'MURYAN', label: formMessageDescriptors.muryan },
  { value: 'BAGERI', label: formMessageDescriptors.bageri },
  { value: 'AHU', label: formMessageDescriptors.ahu },
  { value: 'BASANGE', label: formMessageDescriptors.basange },
  { value: 'NAKERE', label: formMessageDescriptors.nakere },
  { value: 'BATUNU', label: formMessageDescriptors.batunu },
  { value: 'SANGA', label: formMessageDescriptors.sanga },
  { value: 'OHARI', label: formMessageDescriptors.ohari },
  { value: 'NUMURO', label: formMessageDescriptors.numuro },
  { value: 'TANGALE', label: formMessageDescriptors.tangale },
  { value: 'GURUMA', label: formMessageDescriptors.guruma },
  { value: 'OTUWO', label: formMessageDescriptors.otuwo },
  { value: 'BATALA', label: formMessageDescriptors.batala },
  { value: 'OGBO', label: formMessageDescriptors.ogbo },
  { value: 'EGBEMA', label: formMessageDescriptors.egbema },
  { value: 'DARA', label: formMessageDescriptors.dara },
  { value: 'ANDONI', label: formMessageDescriptors.andoni },
  { value: 'OBOLO', label: formMessageDescriptors.obolo },
  { value: 'PEGAN', label: formMessageDescriptors.pegan },
  { value: 'IYALA', label: formMessageDescriptors.iyala },
  { value: 'JIBAWA', label: formMessageDescriptors.jibawa },
  {
    value: 'MUNGADUSO',
    label: formMessageDescriptors.mungaduso
  },
  { value: 'OKOBO', label: formMessageDescriptors.okobo },
  { value: 'OTHERS', label: formMessageDescriptors.others },
  { value: 'DK', label: formMessageDescriptors.dk },
  { value: 'MISSING', label: formMessageDescriptors.missing }
]
