const ZHU_DE_HU_HUAN_TRACKS = [
  "主爱的家",
  "天主经活动版",
  "主你了解我",
  "天主的爱",
  "牵我的手",
  "可爱主耶稣",
  "主的呼唤",
  "欢呼歌",
  "飞吧",
  "耶稣我爱你",
  "天主经弥撒版",
  "小白花",
  "奇迹",
  "我今欢喜",
]

/**
 * Returns "主的呼唤" for the initial 14 album tracks,
 * and "MCG Community" for any upcoming or other songs.
 */
export function getSongCategory(
  track?: { id?: string; title?: string; filename?: string; url?: string } | null
): string {
  if (!track) return "MCG Community"
  const title = (track.title || "").trim()
  const filename = decodeURIComponent(track.filename || track.url || "").trim()

  const isZhuDeHuHuan = ZHU_DE_HU_HUAN_TRACKS.some(
    (name) => title.includes(name) || filename.includes(name)
  )

  return isZhuDeHuHuan ? "主的呼唤" : "MCG Community"
}
