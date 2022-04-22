import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
const BN = require("bn.js");

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  const [tokenData, setTokenData] = React.useState([])

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.nft_tokens_for_owner({ account_id: window.accountId })
          .then(response => {
            console.log("res"+JSON.stringify(response));
            setTokenData(...response)
            if(response.length >0){
              setButtonDisabled(true)
               // show Notification
              setShowNotification(true)
            }
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )



  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR NFT!</h1>
        <p>
          To Mint your NFT you need to sign in using NEAR wallet first
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
            Hello!
          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!
        </h1>
        <div >
          <img src="https://nftnewspro.com/wp-content/uploads/2022/03/Disaster-Girl.jpg" width="550" height="400" />
        </div>
        <form onSubmit={async event => {
          event.preventDefault()

          
          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.nft_mint({

              
                token_id: `${window.accountId}-Near-Spring-token`,
                metadata: {
                  title: "NEAR SPRING NFT",
                  description: "NEAR Spring Challenge 3 NFT :)",
                  media:
                    "https://nftnewspro.com/wp-content/uploads/2022/03/Disaster-Girl.jpg",
                },
                receiver_id: window.accountId,
              },
              300000000000000, // attached GAS (optional)
              new BN("1000000000000000000000000")

            )

          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

         
         

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">
           { !showNotification && <p
              style={{ display: 'flex', alignContent: 'center', justifyContent:'center' }}
            >
             Click "Mint" below to Mint Your NFT meme
            </p> }
            <div style={{ display: 'flex', alignContent: 'center', justifyContent:'center' }}>
              
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                MINT
              </button>
            </div>
          </fieldset>
        </form>
       
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <div>
      <p style={{ textAlign: "center" }}>
                You have successfully minted yourself a NFT! see it on collectibles tabs on your {" "}
                <a href={"https://wallet.testnet.near.org/?tab=collectibles"}>
                NEAR wallet! 
                </a>
                {" "} :)
      </p>
      
    </div>
  )
}
