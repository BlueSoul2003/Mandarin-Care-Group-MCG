import { ArticleReader } from "@/components/ArticleReader"

export default async function SpiritualArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fake Content for Examen
  return (
    <ArticleReader
      title="每日意識省察指南 (Daily Examen)"
      date="Nov 01, 2026"
      author="Spiritual Director"
      category="spiritual"
    >
      <p>
        意識省察（Examen）是聖依納爵·羅耀拉（St. Ignatius of Loyola）所推廣的一種祈禱方式。它不是為了檢視自己犯了多少錯，而是為了在每天的生活中，發現天主的臨在與帶領。
      </p>
      <h2>省察的五個步驟</h2>
      <ol>
        <li>
          <strong>祈求光照（Pray for Light）：</strong>
          <p>安靜下來，意識到天主正看著你，並且深深愛著你。祈求聖神光照你的心，讓你能以天主的眼光回顧這一天。</p>
        </li>
        <li>
          <strong>感恩（Give Thanks）：</strong>
          <p>回想今天發生的美好事物，無論大小。為這些恩寵向天主獻上感謝。</p>
        </li>
        <li>
          <strong>回顧（Review the Day）：</strong>
          <p>像看電影一樣，從早到晚回顧這一天。注意你內心的情緒起伏：什麼時候你感到平安、喜樂（神慰）？什麼時候你感到焦慮、煩躁（神枯）？</p>
        </li>
        <li>
          <strong>反省與懺悔（Face your Shortcomings）：</strong>
          <p>為今天做得不好的地方、或者錯失愛德的時刻，向天主請求寬恕，並相信祂的仁慈。</p>
        </li>
        <li>
          <strong>展望明天（Look Toward the Day to Come）：</strong>
          <p>將明天交託給天主。祈求祂賜下你所需的恩寵，幫助你明天能更親近祂，並愛近人。</p>
        </li>
      </ol>
      <p>
        建議每天晚上睡前，給自己十五分鐘的時間，進行這段寧靜的祈禱。
      </p>
    </ArticleReader>
  )
}
