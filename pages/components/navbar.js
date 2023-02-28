import { Auth, Hub } from "aws-amplify";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import "../../configureAmplify"

const Navbar = () => {
  const [signedUser, setSignedUser] = useState(false)

  async function authListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
          return setSignedUser(true)
        case "signOut":
          return setSignedUser(false)
        // default:
        //   return signedUser
      }
    })
    try {
      await Auth.currentAuthenticatedUser()
      setSignedUser(true)
    } catch (error) {
      // alert(error)
    }
  }

  useEffect(() => {
    authListener()
  }, []);


  return(
    <nav className="flex justify-center pt-3 pb-3 space-x-4 border-b bg-cyan-500 border-gray-300">
      {[
        ["Home", "/"],
        ["Create Post", "/create-post"],
        ["Profile", "/profile"],
        ].map(([title, url], index) => (
          <Link href={url} key={index} legacyBehavior>
            <a className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slage-100 hover:text-slate-500">
              {title}
            </a>
          </Link>
        ))
      }
      { signedUser && (
        <Link href="/my-posts" legacyBehavior>
          <a className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slage-100 hover:text-slate-500">
            My Posts
          </a>
        </Link>
      )}
    </nav>
  )
}

export default Navbar