import test from 'node:test';
import assert from 'node:assert/strict';
import { groupContactHistory } from '../src/lib/lead-grouping.js';
import { normalizeEmail } from '../src/lib/lead-store.js';
test('same email has one contact with all inquiries and questions, preserving timestamps',()=>{
  const contacts=[{id:'1',name:'Person',email:' Person@EXAMPLE.com ',status:'new'},{id:'2',name:'Person',email:'person@example.com',status:'new'},{id:'3',name:'Person',email:'different@example.com',status:'new'}];
  const inquiries=[{id:1,contact_id:1,message:'First question',source:'contact-form',created_at:'2026-11-01T10:00:00Z'},{id:2,contact_id:2,message:'Second question',source:'contact-form',created_at:'2026-11-02T10:00:00Z'}];
  const chats=[{id:3,contact_id:2,question:'Third question',answer:'A reply',created_at:'2026-11-03T10:00:00Z'}];
  const result=groupContactHistory(contacts,inquiries,chats),person=result.find(item=>item.email==='person@example.com');
  assert.equal(result.length,2);assert.equal(person.inquiryCount,2);assert.equal(person.chatQuestionCount,1);assert.equal(person.messageCount,3);assert.deepEqual(person.messages.map(item=>item.text),['Third question','Second question','First question']);assert.equal(person.messages[2].createdAt,'2026-11-01T10:00:00Z');
  assert.equal(normalizeEmail(' Person@EXAMPLE.com '),'person@example.com');assert.notEqual(normalizeEmail('person+work@example.com'),normalizeEmail('person@example.com'));
});
