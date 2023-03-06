import { API, Storage } from "aws-amplify"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { updatePost } from "../../src/graphql/mutations"
import { getPost, listPosts } from "../../src/graphql/queries"
import { v4 as uuid } from "uuid"
import dynamic from "next/dynamic"
const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false
})
// import SimpleMdeReact from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

function EditPost() {
  const [post, setPost] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [localImage, setLocalImage] = useState(null)
  const fileInput = useRef(null)

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    fetchPost()
    async function fetchPost() {
      if (!id) return null
      const postData = await API.graphql({
        query: getPost,
        variables: {id}
      })
      setPost(postData.data.getPost)
      if (postData.data.getPost.coverImage) {
        updateCoverImage(postData.data.getPost.coverImage)
      }
    }
  }, [id])

  if (!post) return null
  async function updateCoverImage(coverImage) {
    const imageKey = await Storage.get(coverImage)
    setCoverImage(imageKey)
  }

  async function uploadImage() {
    fileInput.current.click()
  }
  function handleChange(e) {
    const fileUploaded = e.target.files[0]
    if (!fileUploaded) return null
    setCoverImage(fileUploaded)
    setLocalImage(URL.createObjectURL(fileUploaded))
  }

  function onChange(e) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value
    }))
  }

  const {title, content} = post
  async function updateCurrentPost() {
    if (!title || !content) return null
    const updatedPost = {
      id,
      title,
      content
    }
    if (coverImage && localImage) {
      const fileName = `${coverImage.name}_${uuid()}`
      updatedPost.coverImage = fileName
      await Storage.put(fileName, coverImage)
    }

    await API.graphql({
      query: updatePost,
      variables: { input: updatedPost },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })
    router.push("/my-posts")
  }

  return(
    <div>
      <h1 className='text-3xl font-semibold tracking-wide mt-6 mb-2'>
        Edit post
      </h1>
      {coverImage && (
        <img className='mt-4' src={localImage ? localImage : coverImage} />
      )}
      <input
        onChange={onChange}
        name='title'
        placeholder='Title'
        value={post.title}
        className='border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2'
      />
      <SimpleMdeReact
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <input
        type='file'
        ref={fileInput}
        className='absolute w-0 h-0'
        onChange={handleChange}
      />
      <button
        className='mb-4 bg-purple-600 text-white font-semibold px-8 py-2 rounded-lg'
        onClick={uploadImage}
      >
        Upload Cover Image
      </button>
      <button
        className='mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg'
        onClick={updateCurrentPost}
      >
        Update Post
      </button>
    </div>
  )
}

export default EditPost