// 云函数 updateUserProfile - 更新用户信息
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { nickName, avatarUrl } = event
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, message: '无法获取用户身份' }
  }

  try {
    // 查询用户是否存在
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()

    const updateData = {
      nickName: nickName || '学习者',
      updatedAt: db.serverDate()
    }

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl
    }

    if (userRes.data.length === 0) {
      // 用户不存在，创建新用户
      const result = await db.collection('users').add({
        data: {
          _openid: openid,
          ...updateData,
          createdAt: db.serverDate()
        }
      })
      return { success: true, _id: result._id, isNew: true }
    } else {
      // 用户存在，更新信息
      const result = await db.collection('users').where({
        _openid: openid
      }).update({
        data: updateData
      })
      return { success: true, updated: result.stats.updated, isNew: false }
    }
  } catch (err) {
    console.error('更新用户信息失败:', err)
    return { success: false, message: err.message }
  }
}
