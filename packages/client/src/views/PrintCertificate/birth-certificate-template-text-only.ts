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
const birthCertificateTemplateTextOnly = `<svg width="421" height="595" viewBox="0 0 421 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="420" height="595" transform="translate(0.381287)" fill="white" />
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="199.666">Registration Centre: </tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="199.666">{{ registrationCentre }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="219.666">LGA:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="219.666">{{ registrationLGA }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="239.666">State:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="239.666">{{ registrationState }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px">
    <tspan x="59.7088" y="260.226">This is to certify that the birth, details of which are recorded herein, has been </tspan>
    <tspan x="59.7088" y="274.626">registered on</tspan>
    <tspan x="183.217" y="274.626"> at this registration centre.</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="600" letter-spacing="0px">
    <tspan x="110.045" y="274.626">{{ registrationDate }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="300.392">BRN:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="300.392">{{ registrationNumber }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="320.392">Full Name:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="320.392">{{ childFirstName }}, {{ childFamilyName }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="340.392">Sex:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="340.392">{{ informantGender }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="360.392">Date of Birth:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="360.392">{{ eventDate }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="379.008">Place of Birth:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="379.008">{{ placeOfBirthLocality }}, &#x2028;</tspan>
    <tspan x="162.709" y="392.008">{{ placeOfBirthLGA }}, {{ placeOfBirthState }}</tspan>
  </text>
  {{#if motherFirstName}}
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="413.392">Full Name of Mother: </tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="413.392">{{ motherFamilyName }}, {{ motherFirstName }}</tspan>
  </text>
  {{/if}}
  {{#if fatherFirstName}}
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="432.021">Full Name of Father:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="432.021">{{ fatherFamilyName }}, {{ fatherFirstName }}</tspan>
  </text>
  {{/if}}
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="461.191">Name of Registrar: </tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="461.191">{{ registrarName }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" letter-spacing="0px">
    <tspan x="59.7088" y="481.191">Date:</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="9" font-weight="600" letter-spacing="0px">
    <tspan x="162.709" y="481.191">{{ certificateDate }}</tspan>
  </text>
  <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="6" letter-spacing="0px">
    <tspan x="166.247" y="548.977">Signature of registrar</tspan>
  </text>
  <mask id="mask0_226_222" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="138" y="498" width="116" height="37">
    <rect x="138.881" y="498.472" width="115" height="36.1429" fill="#FCC7C7" />
  </mask>
  <g mask="url(#mask0_226_222)">
    <rect x="143.447" y="498.472" width="106.06" height="37.1756" fill="url(#pattern0)" />
  </g>
  <line x1="136.006" y1="536.5" x2="256.756" y2="536.5" stroke="#A5A5A5" />

  <image
    width="54" height="56"
    x="326" y="503.565"
    xlink:href="{{ qrCode }}"
  />
  <defs>
    <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
      <use xlink:href="#image0_226_222" transform="scale(0.000818331 0.00224215)" />
    </pattern>
    <image id="image0_226_222" data-content="signature" width="1222" height="446" xlink:href="" />
  </defs>
</svg>`

export default birthCertificateTemplateTextOnly
