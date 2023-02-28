import { API } from "aws-amplify"
import { useRouter } from "next/router"
import { useState } from "react"
import { v4 as uuid } from "uuid"
import { createPost } from "../src/graphql/mutations"
import "easymde/dist/easymde.min.css"

const initialState = { title: "", content: "" }
function CreatePost() {
  const [post, setPost] = useState(initialState)
  const { title, content } = post
  const router = useRouter()

  function onChange(e) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value
    }))
  }
  async function createNewPost() {
    if (!title || !content) return
    const id = uuid()
    post.id = id
  
    await API.graphql({
      query: createPost,
      variables: {input: post},
      authMode: "AMAZON_COGNITO_USER_POOLS"
    })
    // router.push(`/post/${id}`)
  }
  return(
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6">Create New Post</h1>
      <input 
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
    </div>
  )
}


export default CreatePost