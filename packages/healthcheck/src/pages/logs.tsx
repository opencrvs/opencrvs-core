import { Content } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'
import React, { useState } from 'react'
import { Check } from 'react-feather'

// function loginToOpenHIM(username: string, password: string) {
//   return generateOpenHIMCredentials({
//     username,
//     password,
//     apiURL: "https://localhost:8080",
//   });
// }

// function tryOpenHIMPassword(password: string) {
//   return loginToOpenHIM("root@openhim.org", password).then(getChannels);
// }

// const loginPromise = login();

// async function getHearthLocations() {
//   const { token } = await loginPromise;
//   return await fetch("http://localhost:5001/fhir/Location", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   }).then((res) => res.json());
// }

export default function logs() {
  const [state, setState] = useState({
    someDevServerRunning: false,
    loggedIn: false
  })
  return (
    // <div>
    //   <Content title="Checks">
    //     <div className="check">
    //       <Icon name="AlertCircle" color="blue" />
    //       Development environment is running&nbsp;
    //       <strong>
    //         {/* {composedState.developmentEnvironment === 'cra'
    //           ? 'Create React App'
    //           : 'Vite'} */}
    //       </strong>
    //     </div>
    //     {/* <Check<{ token: string }>
    //       check={() => loginPromise}
    //       ok={(conf) => {
    //         return (
    //           <span>
    //             Login OK as <strong>kennedy.mweene</strong>
    //           </span>
    //         )
    //       }}
    //       fail={() => (
    //         <span>
    //           Failed to login as <strong>kennedy.mweene</strong>
    //         </span>
    //       )}
    //       instructions={
    //         <span>
    //           Try running `yarn db:backup:restore` in your country config
    //           repository. This command loads a previous backup of the database.
    //         </span>
    //       }
    //     /> */}
    //     {state.loggedIn && (
    //       <>
    //         <Check
    //           check={async () => {
    //             // const data = await getHearthLocations()
    //             // if (!data.total || data.total === 0) {
    //             //   throw new Error('No locations found')
    //             // }
    //           }}
    //           ok={(conf) => {
    //             return <span>There are locations in Hearth</span>
    //           }}
    //           fail={() => (
    //             <span>No locations in Hearth's Locations collection.</span>
    //           )}
    //           instructions={
    //             <span>
    //               Try running <strong>yarn db:backup:restore</strong> in your
    //               country config repository.
    //             </span>
    //           }
    //         />
    //         <Check
    //           // check={getHearthLocations}
    //           ok={(conf) => {
    //             return (
    //               <span>
    //                 <a target="_blank" href="http://localhost:8888">
    //                   OpenHIM
    //                 </a>{' '}
    //                 channels set up and functional
    //               </span>
    //             )
    //           }}
    //           fail={() => (
    //             <span>
    //               Your{' '}
    //               <a target="_blank" href="http://localhost:8888">
    //                 OpenHIM
    //               </a>{' '}
    //               doesn't have any channels.
    //             </span>
    //           )}
    //           instructions={
    //             <span>
    //               Try running <strong>yarn db:backup:restore</strong> in your
    //               country config repository.
    //             </span>
    //           }
    //         />
    //       </>
    //     )}
    //     <Check
    //       check={() =>
    //         tryOpenHIMPassword('password')
    //           .then(() => 'password')
    //           .catch(() =>
    //             tryOpenHIMPassword('wXV8xSW2Ju5X3EPn').then(
    //               () => 'wXV8xSW2Ju5X3EPn'
    //             )
    //           )
    //       }
    //       ok={(password) => {
    //         return (
    //           <span>
    //             OpenHIM login successful with user{' '}
    //             <strong>root@openhim.org</strong> and password{' '}
    //             <strong>{password}</strong>
    //           </span>
    //         )
    //       }}
    //       fail={() => <span>Cannot log in to OpenHIM.</span>}
    //       instructions={
    //         <span>
    //           <strong>Note</strong>, this is non-critical and your environment
    //           might still work fine.
    //           <br />
    //           Make sure you have allowed your browser use OpenHIM's self-signed
    //           certificate{' '}
    //           <a target="_blank" href="https://localhost:8080/heartbeat">
    //             here
    //           </a>
    //           .<br /> Then make sure your OpenHIM username is{' '}
    //           <strong>root@openhim.org</strong> and password is{' '}
    //           <strong>password</strong> or <strong>wXV8xSW2Ju5X3EPn</strong>
    //         </span>
    //       }
    //     />
    //   </Content>
    // </div>
    <div></div>
  )
}
