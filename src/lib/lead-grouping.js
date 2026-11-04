export function groupContactHistory(contacts,inquiries,chats){
  const groups=new Map(),byId=new Map();
  for(const contact of contacts){const email=contact.email.trim().toLowerCase();let group=groups.get(email);if(!group){group={...contact,email,messages:[],inquiryCount:0,chatQuestionCount:0};groups.set(email,group);}byId.set(String(contact.id),group);}
  for(const inquiry of inquiries){const group=byId.get(String(inquiry.contact_id));if(!group)continue;group.inquiryCount++;group.messages.push({id:`inquiry-${inquiry.id}`,kind:'inquiry',text:inquiry.message,source:inquiry.source,createdAt:inquiry.created_at});}
  for(const chat of chats){const group=byId.get(String(chat.contact_id));if(!group)continue;group.chatQuestionCount++;group.messages.push({id:`chat-${chat.id}`,kind:'chat',text:chat.question,answer:chat.answer,needsReview:chat.needs_review,createdAt:chat.created_at});}
  return [...groups.values()].map(group=>{group.messages.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)||b.id.localeCompare(a.id));return {...group,messageCount:group.messages.length,lastActivity:group.messages[0]?.createdAt||group.updated_at,message:group.messages[0]?.text||''};}).sort((a,b)=>new Date(b.lastActivity)-new Date(a.lastActivity));
}
