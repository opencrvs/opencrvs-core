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

import {
  notoSans
  // eslint-disable-next-line import/no-relative-parent-imports
} from './fonts/noto-sans.js'

export const svgCode = `<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="420" height="595" fill="white" />
<rect x="16.5" y="16.5" width="387" height="562" stroke="#EEEEEE" />
<text fill="#35495D" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px">
  <tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px">
  <tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px">
  <tspan x="50%" y="380.552" text-anchor="middle">This event was registered at&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="600" letter-spacing="0px">
  <tspan x="50%" y="400.828" text-anchor="middle">{{registrationLocation}}&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px">
  <tspan x="50%" y="290.828" text-anchor="middle">{{eventDate}}&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px">
  <tspan x="50%" y="270.69" text-anchor="middle">Married on&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px">
  <tspan x="50%" y="320.69" text-anchor="middle">Place of Marriage&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px">
  <tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px">
  <tspan x="50%" y="340.828" text-anchor="middle">{{placeOfMarriage}}&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px">
  <tspan x="50%" y="235.828" text-anchor="middle">{{groomFirstName}} {{groomFamilyName}} &amp; {{brideFirstName}} {{brideFamilyName}}&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px">
  <tspan x="50%" y="215.69" text-anchor="middle">This is to certify that&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px">
  <tspan x="50%" y="145.828" text-anchor="middle">{{registrationNumber}}&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px">
  <tspan x="50%" y="127.828" text-anchor="middle">Marriage Registration No&#10;</tspan>
</text>
<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px">
  <tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {{certificateDate}}</tspan>
</text>

<text fill="#222222" xml:space="default" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">:</tspan></text>
<line x1="43.4985" y1="358.75" x2="376.499" y2="356.75" stroke="#EEEEEE" stroke-width="0.5" />
<line x1="43.4985" y1="189.75" x2="376.499" y2="187.75" stroke="#EEEEEE" stroke-width="0.5" />
<path d="M236.262 59.14C236.265 68.416 236.253 77.695 236.268 86.971C236.274 87.379 236.148 87.766 235.938 88.093C235.743 88.393 235.473 88.639 235.151 88.804L211.04 102.718C210.707 102.907 210.352 103 210.007 103C209.653 103 209.296 102.901 208.978 102.718L184.878 88.816C184.548 88.651 184.269 88.402 184.071 88.099C183.858 87.766 183.732 87.379 183.732 86.968L183.741 86.782L183.735 59.032C183.729 58.66 183.831 58.309 184.005 58.006L184.011 58C184.191 57.688 184.452 57.43 184.764 57.247L208.963 43.282C209.296 43.093 209.653 43 209.995 43C210.349 43 210.71 43.099 211.025 43.282L235.232 57.25C235.572 57.445 235.833 57.727 236.01 58.048L236.016 58.054C236.193 58.384 236.28 58.762 236.262 59.14Z" fill="#EFCFA4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M218.07 96.28H201.936L210.001 100.933L218.07 96.28Z" fill="#EFCFA4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M201.936 96.28H218.07L226.138 91.624H193.868L201.936 96.28Z" fill="#F1B162" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M193.868 91.624H226.138L234.203 86.968H185.8L193.868 91.624Z" fill="#C86E00" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M185.8 86.968H234.203V79.171H185.8V86.968Z" fill="#EFCFA4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M197.836 79.171H222.038L215.986 68.698L210.989 71.581L204.442 75.358L197.836 79.171Z" fill="#E2F5F4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M215.986 68.698L222.038 79.171H234.137L215.986 68.698Z" fill="#038E86" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M215.986 68.698L234.137 79.171L221.527 57.355L203.935 67.51L210.989 71.581L215.986 68.698Z" fill="#E2F5F4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M234.137 79.171L221.527 57.355L234.2 64.669L234.137 79.171Z" fill="#038E86" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M204.442 75.358L197.893 64.024L185.797 71.005L185.8 79.171L197.836 79.171L204.442 75.358Z" fill="#E2F5F4" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M197.893 64.024L204.442 75.358L210.989 71.581L203.935 67.51L197.893 64.024Z" fill="#038E86" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M197.893 64.024L203.935 67.51L221.527 57.358L234.2 64.672V59.035L209.998 45.067L185.797 59.032L185.8 71.002L197.893 64.024ZM209.998 58.021C208.293 58.021 206.913 56.641 206.913 54.94C206.913 53.236 208.293 51.856 209.998 51.856C211.7 51.856 213.084 53.236 213.084 54.94C213.081 56.641 211.7 58.021 209.998 58.021Z" fill="#EEEEEE" />
<path fill-rule="evenodd" clip-rule="evenodd" d="M209.998 58.021C211.703 58.021 213.084 56.641 213.084 54.937C213.084 53.233 211.703 51.853 209.998 51.853C208.293 51.853 206.913 53.233 206.913 54.937C206.913 56.641 208.293 58.021 209.998 58.021Z" fill="#C86E00" />
<path d="M234.887 59.068L234.893 86.965C234.893 87.217 234.755 87.439 234.551 87.559L210.347 101.53C210.127 101.659 209.863 101.65 209.656 101.53L185.455 87.562C185.224 87.427 185.1 87.181 185.112 86.932L185.106 59.035C185.106 58.783 185.245 58.561 185.449 58.441L209.653 44.47C209.875 44.341 210.136 44.35 210.344 44.47L234.545 58.438C234.776 58.573 234.899 58.819 234.887 59.068ZM209.998 51.166C211.04 51.166 211.985 51.589 212.667 52.27C213.348 52.951 213.771 53.896 213.771 54.937C213.771 55.978 213.348 56.92 212.667 57.604C211.985 58.285 211.04 58.708 209.998 58.708C208.957 58.708 208.014 58.285 207.33 57.604C206.649 56.923 206.225 55.978 206.225 54.937C206.225 53.896 206.649 52.954 207.33 52.27L207.372 52.231C208.05 51.574 208.978 51.166 209.998 51.166ZM211.691 53.248C211.259 52.816 210.659 52.546 209.998 52.546C209.35 52.546 208.765 52.801 208.336 53.215L208.305 53.248C207.873 53.68 207.603 54.28 207.603 54.94C207.603 55.6 207.873 56.2 208.305 56.632C208.738 57.064 209.338 57.334 209.998 57.334C210.659 57.334 211.259 57.064 211.691 56.632C212.123 56.2 212.394 55.6 212.394 54.94C212.394 54.28 212.123 53.68 211.691 53.248ZM186.487 86.281H233.516V79.861H186.487V86.281ZM231.631 87.658H188.375L194.051 90.934H225.958L231.631 87.658ZM217.865 70.576L222.434 78.484H231.568L217.865 70.576ZM220.843 78.484L215.734 69.637L200.405 78.484H220.843ZM199.772 65.902L204.695 74.422L209.614 71.584L199.772 65.902ZM203.503 75.109L197.644 64.963L186.484 71.401L186.487 78.484H197.656L203.503 75.109ZM186.484 69.814L197.548 63.43C197.755 63.31 198.016 63.301 198.238 63.43L203.935 66.718L221.182 56.764C221.389 56.644 221.65 56.635 221.873 56.764L233.513 63.481V59.431L209.998 45.859L186.481 59.431L186.484 69.814ZM233.513 65.068L223.415 59.239L233.516 76.723L233.513 65.068ZM221.281 58.294L205.31 67.51L210.989 70.786L215.641 68.101C215.848 67.981 216.11 67.972 216.332 68.101L232.258 77.293L221.281 58.294ZM202.116 95.59H217.886L223.568 92.311H196.437L202.116 95.59ZM215.5 96.967H204.506L210.001 100.138L215.5 96.967Z" fill="#222222" />
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="4.34258" font-weight="800" letter-spacing="0.2em">
  <tspan x="191.848" y="84.9903">FARAJALAND</tspan>
</text>

<mask id="mask0_319_2" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="114" y="420" width="83" height="27">
<rect x="114" y="420" width="83" height="26.7967" fill="#FCC7C7"/>
</mask>
<g mask="url(#mask0_319_2)">
<rect x="117.295" y="420" width="76.5475" height="27.5624" fill="url(#pattern0)"/>
</g>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="6" font-weight="300" letter-spacing="0px"><tspan x="129.007" y="457.211">Signature of groom</tspan></text>
<mask id="mask1_319_2" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="222" y="420" width="83" height="27">
<rect x="222" y="420" width="83" height="26.7967" fill="#FCC7C7"/>
</mask>
<g mask="url(#mask1_319_2)">
<rect x="225.295" y="420" width="76.5475" height="27.5624" fill="url(#pattern1)"/>
</g>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="6" font-weight="300" letter-spacing="0px"><tspan x="239.017" y="457.211">Signature of bride</tspan></text>
<path d="M138.429 532.229H281.571" stroke="#EEEEEE" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>
<mask id="mask2_319_2" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="140" y="479" width="140" height="45">
<rect x="140" y="479.5" width="140" height="44" fill="#FCC7C7"/>
</mask>
<g mask="url(#mask2_319_2)">
<rect x="145.558" y="479.5" width="129.116" height="45.2572" fill="url(#pattern2)"/>
</g>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="209.884" y="558.552">&#10;</tspan></text>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="600" letter-spacing="0px"><tspan x="211.45" y="546.552">{{registrarName}}&#10;</tspan></text>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="161.122" y="546.552">Registered by </tspan></text>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="210" y="573.309">&#10;</tspan></text>
<!-- <text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="141.746" y="561.309">Date of registration: </tspan></text>
<text fill="#222222" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="600" letter-spacing="0px"><tspan x="214.965" y="561.309">10 October 2018&#10;</tspan></text> -->
<rect x="359.771" y="534" width="40" height="40" fill="url(#pattern3)"/>
<defs>
<style type="text/css">
    @font-face {
      font-family: Noto Sans;
      src: url(${notoSans});
    }
  </style>
<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image_groom" transform="scale(0.000818331 0.00224215)"/>
</pattern>
<pattern id="pattern1" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image_bride" transform="scale(0.000818331 0.00224215)"/>
</pattern>
<pattern id="pattern2" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image_registrar" transform="scale(0.000818331 0.00224215)"/>
</pattern>
<pattern id="pattern3" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image_qrcode" transform="translate(0 -0.0207101) scale(0.00295858)"/>
</pattern>
<image id="image_registrar" width="1222" height="446" data-content="signature" xlink:href="{{registrarSignature}}"/>
<image id="image_groom" width="1222" height="446" data-content="groomSignature" xlink:href="{{groomSignature}}"/>
<image id="image_bride" width="1222" height="446" data-content="brideSignature" xlink:href="{{brideSignature}}"/>
<image id="image_qrcode" width="1222" height="446" data-content="qrcode" xlink:href="{{qrCode}}"/>
</defs>
</svg>`
