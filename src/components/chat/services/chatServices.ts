import { supabase } from '../../../lib/supabase'

export const chatService = {
  // Get channels for current user
  async getUserChannels(userId: string) {
    const { data, error } = await supabase
      .from('channel_members')
      .select(`
        channel:channels (*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error getting user channels:', error)
      throw error
    }
    return data?.map(item => item.channel) || []
  },

  // Create a new channel
  async createChannel(name: string, createdBy: string, isPrivate: boolean = false) {
    // First create the channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([
        {
          name,
          type: 'channel',
          is_private: isPrivate,
          created_by: createdBy,
          member_count: 1,
          unread_count: 0
        }
      ])
      .select()
      .single()

    if (channelError) {
      console.error('Error creating channel:', channelError)
      throw channelError
    }

    // Then add the creator as an admin member
    const { error: memberError } = await supabase
      .from('channel_members')
      .insert([
        {
          channel_id: channel.id,
          user_id: createdBy,
          role: 'admin',
          unread_count: 0
        }
      ])

    if (memberError) {
      console.error('Error adding channel member:', memberError)
      throw memberError
    }

    return channel
  },

  // Get messages for a channel - FIXED: No direct auth.users access
  async getChannelMessages(channelId: string, limit: number = 50) {
    try {
      // First get messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (messagesError) {
        console.error('Error getting messages:', messagesError)
        throw messagesError
      }

      if (!messages || messages.length === 0) {
        return []
      }

      // Get current user to use as fallback author data
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Transform messages with author data
      const messagesWithAuthors = messages.map((message) => {
        // For now, use current user as author or create fallback
        // In a real app, you'd have a profiles table or store user data in messages
        return {
          ...message,
          author: {
            id: message.author_id,
            name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User',
            avatar: currentUser?.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.author_id}`,
            initials: currentUser?.user_metadata?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
            email: currentUser?.email || ''
          }
        }
      })

      return messagesWithAuthors
    } catch (error) {
      console.error('Error in getChannelMessages:', error)
      throw error
    }
  },

  // Send a message - FIXED: No direct auth.users access
  async sendMessage(channelId: string, authorId: string, content: string, replyTo?: string) {
    try {
      // Get current user data first
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            channel_id: channelId,
            author_id: authorId,
            content,
            reply_to: replyTo
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      // Create the transformed message with author data from current user
      const transformedMessage = {
        ...data,
        author: {
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          avatar: currentUser.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
          initials: currentUser.user_metadata?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
          email: currentUser.email
        }
      }

      // Try to increment unread count for other members
      try {
        await supabase.rpc('increment_channel_unread', {
          channel_id: channelId,
          exclude_user_id: authorId
        })
      } catch (rpcError) {
        console.warn('Could not increment unread count:', rpcError)
      }

      return transformedMessage
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  },

  // Mark messages as read
  async markMessagesAsRead(channelId: string, userId: string) {
    try {
      // Get all unread messages for this channel
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id')
        .eq('channel_id', channelId)
        .not('author_id', 'eq', userId) // Only messages from others
        .not('id', 'in', 
          supabase.from('message_reads')
            .select('message_id')
            .eq('user_id', userId)
        )

      if (fetchError) {
        console.error('Error fetching unread messages:', fetchError)
        throw fetchError
      }

      // Mark each message as read
      if (unreadMessages && unreadMessages.length > 0) {
        const readRecords = unreadMessages.map(message => ({
          message_id: message.id,
          user_id: userId
        }))

        const { error: insertError } = await supabase
          .from('message_reads')
          .insert(readRecords)

        if (insertError) {
          console.error('Error marking messages as read:', insertError)
          throw insertError
        }
      }

      // Reset user's unread count for this channel
      const { error } = await supabase
        .from('channel_members')
        .update({ unread_count: 0 })
        .eq('channel_id', channelId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error resetting unread count:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
      throw error
    }
  },

  // Add reaction to message
  async addReaction(messageId: string, userId: string, emoji: string) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .insert([
          {
            message_id: messageId,
            user_id: userId,
            emoji
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding reaction:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Error in addReaction:', error)
      throw error
    }
  },

  // Get channel members - FIXED: No direct auth.users access
  async getChannelMembers(channelId: string) {
    try {
      // Get channel members
      const { data: members, error: membersError } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', channelId)

      if (membersError) {
        console.error('Error getting channel members:', membersError)
        throw membersError
      }

      if (!members || members.length === 0) {
        return []
      }

      // Get current user for fallback data
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Transform members with user data
      const membersWithUsers = members.map((member) => {
        // For now, use current user data or create fallback
        // In a real app, you'd have a profiles table
        return {
          ...member,
          user: {
            id: member.user_id,
            name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User',
            avatar: currentUser?.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`,
            initials: currentUser?.user_metadata?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
            email: currentUser?.email || ''
          }
        }
      })

      return membersWithUsers
    } catch (error) {
      console.error('Error in getChannelMembers:', error)
      throw error
    }
  },

  // Real-time subscriptions - FIXED: No direct auth.users access
  subscribeToMessages(channelId: string, callback: (message: any) => void) {
    try {
      const subscription = supabase
        .channel(`messages:${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channelId}`
          },
          async (payload) => {
            try {
              // Get current user for author data
              const { data: { user: currentUser } } = await supabase.auth.getUser()
              
              const transformedMessage = {
                ...payload.new,
                author: {
                  id: payload.new.author_id,
                  name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'User',
                  avatar: currentUser?.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.author_id}`,
                  initials: currentUser?.user_metadata?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
                  email: currentUser?.email || ''
                }
              }
              callback(transformedMessage)
            } catch (error) {
              console.error('Error processing real-time message:', error)
              // Send basic message as fallback
              callback({
                ...payload.new,
                author: {
                  id: payload.new.author_id,
                  name: 'User',
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.author_id}`,
                  initials: 'U',
                  email: ''
                }
              })
            }
          }
        )
        .subscribe()

      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  },

  unsubscribe(channel: any) {
    if (channel) {
      return supabase.removeChannel(channel)
    }
  }
}