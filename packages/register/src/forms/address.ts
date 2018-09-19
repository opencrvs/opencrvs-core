import { defineMessages } from 'react-intl'

import { IFormField, IFormSectionData, IDynamicOptions } from './index'

export const stateMessages = defineMessages({
  state1: {
    id: 'states.state1',
    defaultMessage: 'Barishal Division',
    description: 'State 1'
  },
  state2: {
    id: 'states.state2',
    defaultMessage: 'Dhaka Division',
    description: 'State 2'
  },
  state3: {
    id: 'states.state3',
    defaultMessage: 'Khulna Division',
    description: 'State 3'
  },
  state4: {
    id: 'states.state4',
    defaultMessage: 'Mymensingh Division',
    description: 'State 4'
  },
  state5: {
    id: 'states.state5',
    defaultMessage: 'Chittagong Division',
    description: 'State 5'
  },
  state6: {
    id: 'states.state6',
    defaultMessage: 'Rajshahi Division',
    description: 'State 6'
  },
  state7: {
    id: 'states.state7',
    defaultMessage: 'Rangpur Division',
    description: 'State 7'
  },
  state8: {
    id: 'states.state8',
    defaultMessage: 'Sylhet Division',
    description: 'State 8'
  }
})

export const states = [
  {
    value: 'state1',
    label: stateMessages.state1
  },
  {
    value: 'state2',
    label: stateMessages.state2
  },
  {
    value: 'state3',
    label: stateMessages.state3
  },
  {
    value: 'state4',
    label: stateMessages.state4
  },
  {
    value: 'state5',
    label: stateMessages.state5
  },
  {
    value: 'state6',
    label: stateMessages.state6
  },
  {
    value: 'state7',
    label: stateMessages.state7
  },
  {
    value: 'state8',
    label: stateMessages.state8
  }
]

export const state2DistrictMessages = defineMessages({
  state2District1: {
    id: 'states.state2.district1',
    defaultMessage: 'Dhaka District',
    description: 'State 2 District 1'
  },
  state2District2: {
    id: 'states.state2.district2',
    defaultMessage: 'Gazipur District',
    description: 'State 2 District 2'
  },
  state2District3: {
    id: 'states.state2.district3',
    defaultMessage: 'Kishoreganj District',
    description: 'State 2 District 3'
  },
  state2District4: {
    id: 'states.state2.district4',
    defaultMessage: 'Manikganj District',
    description: 'State 2 District 4'
  },
  state2District5: {
    id: 'states.state2.district5',
    defaultMessage: 'Munshiganj District',
    description: 'State 2 District 5'
  },
  state2District6: {
    id: 'states.state2.district6',
    defaultMessage: 'Narayanganj District',
    description: 'State 2 District 6'
  },
  state2District7: {
    id: 'states.state2.district7',
    defaultMessage: 'Narsingdi District',
    description: 'State 2 District 7'
  },
  state2District8: {
    id: 'states.state2.district8',
    defaultMessage: 'Faridpur District',
    description: 'State 2 District 8'
  },
  state2District9: {
    id: 'states.state2.district9',
    defaultMessage: 'Gopalganj District',
    description: 'State 2 District 9'
  },
  state2District10: {
    id: 'states.state2.district10',
    defaultMessage: 'Madaripur District',
    description: 'State 2 District 10'
  },
  state2District11: {
    id: 'states.state2.district11',
    defaultMessage: 'Rajbari District',
    description: 'State 2 District 11'
  },
  state2District12: {
    id: 'states.state2.district12',
    defaultMessage: 'Shariatpur District',
    description: 'State 2 District 11'
  }
})

export const state2Districts = [
  {
    value: 'district1',
    label: state2DistrictMessages.state2District1
  },
  {
    value: 'district2',
    label: state2DistrictMessages.state2District2
  },
  {
    value: 'district3',
    label: state2DistrictMessages.state2District3
  },
  {
    value: 'district4',
    label: state2DistrictMessages.state2District4
  },
  {
    value: 'district5',
    label: state2DistrictMessages.state2District5
  },
  {
    value: 'district6',
    label: state2DistrictMessages.state2District6
  },
  {
    value: 'district7',
    label: state2DistrictMessages.state2District7
  },
  {
    value: 'district8',
    label: state2DistrictMessages.state2District8
  },
  {
    value: 'district9',
    label: state2DistrictMessages.state2District9
  },
  {
    value: 'district10',
    label: state2DistrictMessages.state2District10
  },
  {
    value: 'district11',
    label: state2DistrictMessages.state2District11
  },
  {
    value: 'district12',
    label: state2DistrictMessages.state2District12
  }
]

export const state4DistrictMessages = defineMessages({
  state4District1: {
    id: 'states.state4.district1',
    defaultMessage: 'Jamalpur District',
    description: 'State 4 District 1'
  },
  state4District2: {
    id: 'states.state4.district2',
    defaultMessage: 'Mymensingh District',
    description: 'State 4 District 2'
  },
  state4District3: {
    id: 'states.state4.district3',
    defaultMessage: 'Netrokona District',
    description: 'State 4 District 3'
  },
  state4District4: {
    id: 'states.state4.district4',
    defaultMessage: 'Sherpur District',
    description: 'State 4 District 4'
  }
})

export const state4Districts = [
  {
    value: 'district1',
    label: state4DistrictMessages.state4District1
  },
  {
    value: 'district2',
    label: state4DistrictMessages.state4District2
  },
  {
    value: 'district3',
    label: state4DistrictMessages.state4District3
  },
  {
    value: 'district4',
    label: state4DistrictMessages.state4District4
  }
]

export const state2District2UpazilaMessages = defineMessages({
  state2District2Upazila1: {
    id: 'states.state2.district2.upazila1',
    defaultMessage: 'Gazipur Sadar Upazila',
    description: 'State 2 District 2 Upazila 1'
  },
  state2District2Upazila2: {
    id: 'states.state2.district2.upazila2',
    defaultMessage: 'Kaliakair Upazila',
    description: 'State 2 District 2 Upazila 2'
  },
  state2District2Upazila3: {
    id: 'states.state2.district2.upazila3',
    defaultMessage: 'Kapasia Upazila',
    description: 'State 2 District 2 Upazila 3'
  },
  state2District2Upazila4: {
    id: 'states.state2.district2.upazila4',
    defaultMessage: 'Sreepur Upazila',
    description: 'State 2 District 2 Upazila 4'
  },
  state2District2Upazila5: {
    id: 'states.state2.district2.upazila5',
    defaultMessage: 'Kaliganj Upazila',
    description: 'State 2 District 2 Upazila 5'
  },
  state2District2Upazila6: {
    id: 'states.state2.district2.upazila6',
    defaultMessage: 'Gazipur City Corporation',
    description: 'State 2 District 2 Upazila 6'
  }
})

export const state2District2Upazilas = [
  {
    value: 'upazila1',
    label: state2District2UpazilaMessages.state2District2Upazila1
  },
  {
    value: 'upazila2',
    label: state2District2UpazilaMessages.state2District2Upazila2
  },
  {
    value: 'upazila3',
    label: state2District2UpazilaMessages.state2District2Upazila3
  },
  {
    value: 'upazila4',
    label: state2District2UpazilaMessages.state2District2Upazila4
  },
  {
    value: 'upazila5',
    label: state2District2UpazilaMessages.state2District2Upazila5
  },
  {
    value: 'upazila6',
    label: state2District2UpazilaMessages.state2District2Upazila6
  }
]

export const state2District2Upazila5UnionMessages = defineMessages({
  state2District2Upazila5Union1: {
    id: 'states.state2.district2.upazila5.union1',
    defaultMessage: 'Bahadursadi',
    description: 'State 2 District 2 Upazila 5 Union 1'
  },
  state2District2Upazila5Union2: {
    id: 'states.state2.district2.upazila5.union2',
    defaultMessage: 'Baktarpur',
    description: 'State 2 District 2 Upazila 5 Union 2'
  },
  state2District2Upazila5Union3: {
    id: 'states.state2.district2.upazila5.union3',
    defaultMessage: 'Jamalpur',
    description: 'State 2 District 2 Upazila 5 Union 3'
  },
  state2District2Upazila5Union4: {
    id: 'states.state2.district2.upazila5.union4',
    defaultMessage: 'Jangalia',
    description: 'State 2 District 2 Upazila 5 Union 4'
  },
  state2District2Upazila5Union5: {
    id: 'states.state2.district2.upazila5.union5',
    defaultMessage: 'Moktarpur',
    description: 'State 2 District 2 Upazila 5 Union 5'
  },
  state2District2Upazila5Union6: {
    id: 'states.state2.district2.upazila5.union6',
    defaultMessage: 'Nagari',
    description: 'State 2 District 2 Upazila 5 Union 6'
  },
  state2District2Upazila5Union7: {
    id: 'states.state2.district2.upazila5.union7',
    defaultMessage: 'Tumulia',
    description: 'State 2 District 2 Upazila 5 Union 7'
  }
})

export const state2District2Upazila5Unions = [
  {
    value: 'union1',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union1
  },
  {
    value: 'union2',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union2
  },
  {
    value: 'union3',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union3
  },
  {
    value: 'union4',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union4
  },
  {
    value: 'union5',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union5
  },
  {
    value: 'union6',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union6
  },
  {
    value: 'union7',
    label: state2District2Upazila5UnionMessages.state2District2Upazila5Union7
  }
]

export const state4District1UpazilaMessages = defineMessages({
  state4District1Upazila1: {
    id: 'states.state4.district1.upazila1',
    defaultMessage: 'Bakshiganj Upazila',
    description: 'State 4 District 1 Upazila 1'
  },
  state4District1Upazila2: {
    id: 'states.state4.district1.upazila2',
    defaultMessage: 'Dewanganj Upazila',
    description: 'State 4 District 1 Upazila 2'
  },
  state4District1Upazila3: {
    id: 'states.state4.district1.upazila3',
    defaultMessage: 'Islampur Upazila',
    description: 'State 4 District 1 Upazila 3'
  },
  state4District1Upazila4: {
    id: 'states.state4.district1.upazila4',
    defaultMessage: 'Jamalpur Sadar Upazila',
    description: 'State 4 District 1 Upazila 4'
  },
  state4District1Upazila5: {
    id: 'states.state4.district1.upazila5',
    defaultMessage: 'Madarganj Upazila',
    description: 'State 4 District 1 Upazila 5'
  },
  state4District1Upazila6: {
    id: 'states.state4.district1.upazila6',
    defaultMessage: 'Melandaha Upazila',
    description: 'State 4 District 1 Upazila 6'
  },
  state4District1Upazila7: {
    id: 'states.state4.district1.upazila7',
    defaultMessage: 'Sarishabari Upazila',
    description: 'State 4 District 1 Upazila 7'
  }
})

export const state4District1Upazilas = [
  {
    value: 'upazila1',
    label: state4District1UpazilaMessages.state4District1Upazila1
  },
  {
    value: 'upazila2',
    label: state4District1UpazilaMessages.state4District1Upazila2
  },
  {
    value: 'upazila3',
    label: state4District1UpazilaMessages.state4District1Upazila3
  },
  {
    value: 'upazila4',
    label: state4District1UpazilaMessages.state4District1Upazila4
  },
  {
    value: 'upazila5',
    label: state4District1UpazilaMessages.state4District1Upazila5
  },
  {
    value: 'upazila6',
    label: state4District1UpazilaMessages.state4District1Upazila6
  },
  {
    value: 'upazila7',
    label: state4District1UpazilaMessages.state4District1Upazila7
  }
]

export const state4District2UpazilaMessages = defineMessages({
  state4District2Upazila1: {
    id: 'states.state4.district2.upazila1',
    defaultMessage: 'Bhaluka Upazila',
    description: 'State 4 District 2 Upazila 1'
  },
  state4District2Upazila2: {
    id: 'states.state4.district2.upazila2',
    defaultMessage: 'Trishal Upazila',
    description: 'State 4 District 2 Upazila 2'
  },
  state4District2Upazila3: {
    id: 'states.state4.district2.upazila3',
    defaultMessage: 'Haluaghat Upazila',
    description: 'State 4 District 2 Upazila 3'
  },
  state4District2Upazila4: {
    id: 'states.state4.district2.upazila4',
    defaultMessage: 'Muktagachha Upazila',
    description: 'State 4 District 2 Upazila 4'
  },
  state4District2Upazila5: {
    id: 'states.state4.district2.upazila5',
    defaultMessage: 'Dhobaura Upazila',
    description: 'State 4 District 2 Upazila 5'
  },
  state4District2Upazila6: {
    id: 'states.state4.district2.upazila6',
    defaultMessage: 'Fulbaria Upazila',
    description: 'State 4 District 2 Upazila 6'
  },
  state4District2Upazila7: {
    id: 'states.state4.district2.upazila7',
    defaultMessage: 'Gaffargaon Upazila',
    description: 'State 4 District 2 Upazila 7'
  },
  state4District2Upazila8: {
    id: 'states.state4.district2.upazila8',
    defaultMessage: 'Gauripur Upazila',
    description: 'State 4 District 2 Upazila 8'
  },
  state4District2Upazila9: {
    id: 'states.state4.district2.upazila9',
    defaultMessage: 'Ishwarganj Upazila',
    description: 'State 4 District 2 Upazila 9'
  },
  state4District2Upazila10: {
    id: 'states.state4.district2.upazila10',
    defaultMessage: 'Mymensingh Sadar Upazila',
    description: 'State 4 District 2 Upazila 10'
  },
  state4District2Upazila11: {
    id: 'states.state4.district2.upazila11',
    defaultMessage: 'Nandail Upazila',
    description: 'State 4 District 2 Upazila 11'
  },
  state4District2Upazila12: {
    id: 'states.state4.district2.upazila12',
    defaultMessage: 'Phulpur Upazila',
    description: 'State 4 District 2 Upazila 12'
  }
})

export const state4District2Upazilas = [
  {
    value: 'upazila1',
    label: state4District2UpazilaMessages.state4District2Upazila1
  },
  {
    value: 'upazila2',
    label: state4District2UpazilaMessages.state4District2Upazila2
  },
  {
    value: 'upazila3',
    label: state4District2UpazilaMessages.state4District2Upazila3
  },
  {
    value: 'upazila4',
    label: state4District2UpazilaMessages.state4District2Upazila4
  },
  {
    value: 'upazila5',
    label: state4District2UpazilaMessages.state4District2Upazila5
  },
  {
    value: 'upazila6',
    label: state4District2UpazilaMessages.state4District2Upazila6
  },
  {
    value: 'upazila7',
    label: state4District2UpazilaMessages.state4District2Upazila7
  },
  {
    value: 'upazila8',
    label: state4District2UpazilaMessages.state4District2Upazila8
  },
  {
    value: 'upazila9',
    label: state4District2UpazilaMessages.state4District2Upazila9
  },
  {
    value: 'upazila10',
    label: state4District2UpazilaMessages.state4District2Upazila10
  },
  {
    value: 'upazila11',
    label: state4District2UpazilaMessages.state4District2Upazila11
  },
  {
    value: 'upazila12',
    label: state4District2UpazilaMessages.state4District2Upazila12
  }
]

export const state4District1Upazila4UnionMessages = defineMessages({
  state4District1Upazila4Union1: {
    id: 'states.state4.district1.upazila4.union1',
    defaultMessage: 'Banshchara',
    description: 'State 4 District 1 Upazila 4 Union 1'
  },
  state4District1Upazila4Union2: {
    id: 'states.state4.district1.upazila4.union2',
    defaultMessage: 'Chandra',
    description: 'State 4 District 1 Upazila 4 Union 2'
  },
  state4District1Upazila4Union3: {
    id: 'states.state4.district1.upazila4.union3',
    defaultMessage: 'Digpaith',
    description: 'State 4 District 1 Upazila 4 Union 3'
  },
  state4District1Upazila4Union4: {
    id: 'states.state4.district1.upazila4.union4',
    defaultMessage: 'Ghoradhap',
    description: 'State 4 District 1 Upazila 4 Union 4'
  },
  state4District1Upazila4Union5: {
    id: 'states.state4.district1.upazila4.union5',
    defaultMessage: 'Itail',
    description: 'State 4 District 1 Upazila 4 Union 5'
  },
  state4District1Upazila4Union6: {
    id: 'states.state4.district1.upazila4.union6',
    defaultMessage: 'Kendua',
    description: 'State 4 District 1 Upazila 4 Union 6'
  },
  state4District1Upazila4Union7: {
    id: 'states.state4.district1.upazila4.union7',
    defaultMessage: 'Lakshmir Char',
    description: 'State 4 District 1 Upazila 4 Union 7'
  },
  state4District1Upazila4Union8: {
    id: 'states.state4.district1.upazila4.union8',
    defaultMessage: 'Narundi',
    description: 'State 4 District 1 Upazila 4 Union 8'
  },
  state4District1Upazila4Union9: {
    id: 'states.state4.district1.upazila4.union9',
    defaultMessage: 'Ranagachha',
    description: 'State 4 District 1 Upazila 4 Union 9'
  },
  state4District1Upazila4Union10: {
    id: 'states.state4.district1.upazila4.union10',
    defaultMessage: 'Rashidpur',
    description: 'State 4 District 1 Upazila 4 Union 10'
  },
  state4District1Upazila4Union11: {
    id: 'states.state4.district1.upazila4.union11',
    defaultMessage: 'Sahabajpur',
    description: 'State 4 District 1 Upazila 4 Union 11'
  },
  state4District1Upazila4Union12: {
    id: 'states.state4.district1.upazila4.union12',
    defaultMessage: 'Sharifpur',
    description: 'State 4 District 1 Upazila 4 Union 12'
  },
  state4District1Upazila4Union13: {
    id: 'states.state4.district1.upazila4.union13',
    defaultMessage: 'Sreepur',
    description: 'State 4 District 1 Upazila 4 Union 13'
  },
  state4District1Upazila4Union14: {
    id: 'states.state4.district1.upazila4.union14',
    defaultMessage: 'Titpalla',
    description: 'State 4 District 1 Upazila 4 Union 14'
  },
  state4District1Upazila4Union15: {
    id: 'states.state4.district1.upazila4.union15',
    defaultMessage: 'Tulsir Char',
    description: 'State 4 District 1 Upazila 4 Union 15'
  }
})

export const state4District1Upazila4Unions = [
  {
    value: 'union1',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union1
  },
  {
    value: 'union2',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union2
  },
  {
    value: 'union3',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union3
  },
  {
    value: 'union4',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union4
  },
  {
    value: 'union5',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union5
  },
  {
    value: 'union6',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union6
  },
  {
    value: 'union7',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union7
  },
  {
    value: 'union8',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union8
  },
  {
    value: 'union9',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union9
  },
  {
    value: 'union10',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union10
  },
  {
    value: 'union11',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union11
  },
  {
    value: 'union12',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union12
  },
  {
    value: 'union13',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union13
  },
  {
    value: 'union14',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union14
  },
  {
    value: 'union15',
    label: state4District1Upazila4UnionMessages.state4District1Upazila4Union15
  }
]

export const state4District2Upazila10UnionMessages = defineMessages({
  state4District2Upazila10Union1: {
    id: 'states.state4.district2.upazila10.union1',
    defaultMessage: 'Akua',
    description: 'State 4 District 1 Upazila 10 Union 1'
  },
  state4District2Upazila10Union2: {
    id: 'states.state4.district2.upazila10.union2',
    defaultMessage: 'Anandipur',
    description: 'State 4 District 1 Upazila 10 Union 2'
  },
  state4District2Upazila10Union3: {
    id: 'states.state4.district2.upazila10.union3',
    defaultMessage: 'Ashtadhar',
    description: 'State 4 District 1 Upazila 10 Union 3'
  },
  state4District2Upazila10Union4: {
    id: 'states.state4.district2.upazila10.union4',
    defaultMessage: 'Baira (kewatkhali)',
    description: 'State 4 District 1 Upazila 10 Union 4'
  },
  state4District2Upazila10Union5: {
    id: 'states.state4.district2.upazila10.union5',
    defaultMessage: 'Bhabkhali',
    description: 'State 4 District 1 Upazila 10 Union 5'
  },
  state4District2Upazila10Union6: {
    id: 'states.state4.district2.upazila10.union6',
    defaultMessage: 'Borar Char',
    description: 'State 4 District 1 Upazila 10 Union 6'
  },
  state4District2Upazila10Union7: {
    id: 'states.state4.district2.upazila10.union7',
    defaultMessage: 'Char Ishwardia',
    description: 'State 4 District 1 Upazila 10 Union 7'
  },
  state4District2Upazila10Union8: {
    id: 'states.state4.district2.upazila10.union8',
    defaultMessage: 'Char Nilakshmia',
    description: 'State 4 District 1 Upazila 10 Union 8'
  },
  state4District2Upazila10Union9: {
    id: 'states.state4.district2.upazila10.union9',
    defaultMessage: 'Dapunia',
    description: 'State 4 District 1 Upazila 10 Union 9'
  },
  state4District2Upazila10Union10: {
    id: 'states.state4.district2.upazila10.union10',
    defaultMessage: 'Ghagra',
    description: 'State 4 District 1 Upazila 10 Union 10'
  },
  state4District2Upazila10Union11: {
    id: 'states.state4.district2.upazila10.union11',
    defaultMessage: 'Khagdahar',
    description: 'State 4 District 1 Upazila 10 Union 11'
  },
  state4District2Upazila10Union12: {
    id: 'states.state4.district2.upazila10.union12',
    defaultMessage: 'Kushtia',
    description: 'State 4 District 1 Upazila 10 Union 12'
  },
  state4District2Upazila10Union13: {
    id: 'states.state4.district2.upazila10.union13',
    defaultMessage: 'Paranganj',
    description: 'State 4 District 1 Upazila 10 Union 13'
  },
  state4District2Upazila10Union14: {
    id: 'states.state4.district2.upazila10.union14',
    defaultMessage: 'Sirta',
    description: 'State 4 District 1 Upazila 10 Union 14'
  }
})

export const state4District2Upazila10Unions = [
  {
    value: 'union1',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union1
  },
  {
    value: 'union2',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union2
  },
  {
    value: 'union3',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union3
  },
  {
    value: 'union4',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union4
  },
  {
    value: 'union5',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union5
  },
  {
    value: 'union6',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union6
  },
  {
    value: 'union7',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union7
  },
  {
    value: 'union8',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union8
  },
  {
    value: 'union9',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union9
  },
  {
    value: 'union10',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union10
  },
  {
    value: 'union11',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union11
  },
  {
    value: 'union12',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union12
  },
  {
    value: 'union13',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union13
  },
  {
    value: 'union14',
    label: state4District2Upazila10UnionMessages.state4District2Upazila10Union14
  }
]

export const messages = defineMessages({
  country: {
    id: 'formFields.country',
    defaultMessage: 'Country',
    description: 'Title for the country select'
  },
  state: {
    id: 'formFields.state',
    defaultMessage: 'Division',
    description: 'Title for the state select'
  },
  district: {
    id: 'formFields.district',
    defaultMessage: 'District',
    description: 'Title for the district select'
  },
  addressLine1: {
    id: 'formFields.addressLine1',
    defaultMessage: 'Street and house number',
    description: 'Title for the address line 1'
  },
  addressLine2: {
    id: 'formFields.addressLine2',
    defaultMessage: 'Area / Mouja / Village',
    description: 'Title for the address line 2'
  },
  addressLine3Options1: {
    id: 'formFields.addressLine3Options1',
    defaultMessage: 'Union / Cantonement',
    description: 'Title for the address line 3 option 1'
  },
  addressLine3Options2: {
    id: 'formFields.addressLine3Options2',
    defaultMessage: 'Ward / Cantonement',
    description: 'Title for the address line 3 option 2'
  },
  addressLine4: {
    id: 'formFields.addressLine4',
    defaultMessage: 'Upazila (Thana) / City',
    description: 'Title for the address line 4'
  },
  postCode: {
    id: 'formFields.postCode',
    defaultMessage: 'Postcode',
    description: 'Title for the postcode field'
  },
  permanentAddress: {
    id: 'formFields.permanentAddress',
    defaultMessage: 'Is the permanent address the same as the current address?',
    description:
      'Question to set permanent address as the same as the current address.'
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  addressSameAsMother: {
    id: 'formFields.addressSameAsMother',
    defaultMessage: "Is his current address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's current address is the same as the mother's address"
  },
  permanentAddressSameAsMother: {
    id: 'formFields.permanentAddressSameAsMother',
    defaultMessage: "Is his permanent address the same as the mother's?",
    description:
      "Title for the radio button to select that the father's permanent address is the same as the mother's address"
  }
})

export const addressOptions = {
  state1: {
    districts: null
  },
  state2: {
    districts: state2Districts,
    district1: {
      upazilas: []
    },
    district2: {
      upazilas: state2District2Upazilas,
      upazila1: {
        unions: []
      },
      upazila2: {
        unions: []
      },
      upazila3: {
        unions: []
      },
      upazila4: {
        unions: []
      },
      upazila5: {
        unions: state2District2Upazila5Unions
      },
      upazila6: {
        unions: []
      }
    },
    district3: {
      upazilas: []
    },
    district4: {
      upazilas: []
    },
    district5: {
      upazilas: []
    },
    district6: {
      upazilas: []
    },
    district7: {
      upazilas: []
    },
    district8: {
      upazilas: []
    },
    district9: {
      upazilas: []
    },
    district10: {
      upazilas: []
    },
    district11: {
      upazilas: []
    },
    district12: {
      upazilas: []
    }
  },
  state3: {
    districts: []
  },
  state4: {
    districts: state4Districts,
    district1: {
      upazilas: state4District1Upazilas,
      upazila1: {
        unions: []
      },
      upazila2: {
        unions: []
      },
      upazila3: {
        unions: []
      },
      upazila4: {
        unions: state4District1Upazila4Unions
      },
      upazila5: {
        unions: []
      },
      upazila6: {
        unions: []
      },
      upazila7: {
        unions: []
      }
    },
    district2: {
      upazilas: state4District2Upazilas,
      upazila1: {
        unions: []
      },
      upazila2: {
        unions: []
      },
      upazila3: {
        unions: []
      },
      upazila4: {
        unions: []
      },
      upazila5: {
        unions: []
      },
      upazila6: {
        unions: []
      },
      upazila7: {
        unions: []
      },
      upazila8: {
        unions: []
      },
      upazila9: {
        unions: []
      },
      upazila10: {
        unions: state4District2Upazila10Unions
      },
      upazila11: {
        unions: []
      },
      upazila12: {
        unions: []
      }
    },
    district3: {
      upazilas: []
    },
    district4: {
      upazilas: []
    }
  },
  state5: {
    districts: []
  },
  state6: {
    districts: []
  },
  state7: {
    districts: []
  }
}

export const getAddressOptions = (
  field: IFormField,
  values: IFormSectionData
) => {
  if (field.dynamicOptions) {
    const dependenciesExist: boolean = field.dynamicOptions.dependencies.every(
      (dependency: string, index: number) => {
        const options = field.dynamicOptions as IDynamicOptions
        /* tslint:disable-next-line: no-eval */
        if (!eval(dependency)) {
          return false
        } else {
          switch (index) {
            case 0:
              /* tslint:disable-next-line: no-eval */
              return addressOptions[eval(dependency)]
              break
            case 1:
              /* tslint:disable-next-line: no-eval */
              return addressOptions[eval(options.dependencies[0])][
                /* tslint:disable-next-line: no-eval */
                eval(dependency)
              ]
              break
            case 2:
              /* tslint:disable-next-line: no-eval */
              return addressOptions[eval(options.dependencies[0])][
                /* tslint:disable-next-line: no-eval */
                eval(options.dependencies[1])
                /* tslint:disable-next-line: no-eval */
              ][eval(dependency)]

              break
          }
        }
      }
    )
    if (dependenciesExist) {
      /* tslint:disable-next-line: no-eval */
      const dynamicOptions = eval(field.dynamicOptions.value)
      if (dynamicOptions.length) {
        return dynamicOptions
      } else {
        return []
      }
    } else {
      return []
    }
  }
}
