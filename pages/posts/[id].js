import { API, Storage } from "aws-amplify"
import { useRouter } from "next/router"
import "../../configureAmplify"
import { getPost, listPosts } from "../../src/graphql/queries"
import ReactMarkDown from "react-markdown"
import { useEffect, useState } from "react"

export default function Post({post}) {
  const router = useRouter()
  const [coverImage, setCoverImage] = useState(null)

  useEffect(() => {
    updateCoverImage()
  }, [])

  async function updateCoverImage() {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage)
      setCoverImage(imageKey)
    }
  }

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return(
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">
        {post.title}
      </h1>

      {
        coverImage && (
          <img src={coverImage} className="mt-4" />
        )
      }

      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        <ReactMarkDown className="prose">{post.content}</ReactMarkDown>
        {/* <p ReactMarkdown="prose">By: {post.content}</p> */}
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const postData = await API.graphql({
    query: listPosts
  })
  const paths = postData.data.listPosts.items.map(post => ({
    params: {id: post.id}
  }))
  return { paths, fallback: true }
}

export async function getStaticProps({params}) {
  const {id} = params
  const postData = await API.graphql({
    query: getPost,
    variables: { id }
  })
  return { 
    props: {post: postData.data.getPost},
    revalidate: 1
  }
}