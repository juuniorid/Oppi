export interface MockUser {
  id: number;
  name: string;
  avatar?: string;
  role: 'TEACHER' | 'PARENT' | 'ADMIN';
}

export interface MockMessage {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  timestamp: Date;
}

export interface MockConversation {
  id: number;
  name: string;
  isGroup: boolean;
  participants: MockUser[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Current user (mock: the logged-in teacher)
export const currentUser: MockUser = {
  id: 1,
  name: 'Mari Tamm',
  role: 'TEACHER',
};

export const mockUsers: MockUser[] = [
  currentUser,
  { id: 2, name: 'Kati Kask', role: 'PARENT' },
  { id: 3, name: 'Jüri Sepp', role: 'PARENT' },
  { id: 4, name: 'Anna Mets', role: 'TEACHER' },
  { id: 5, name: 'Peeter Pärn', role: 'PARENT' },
  { id: 6, name: 'Liina Vaher', role: 'ADMIN' },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const mockConversations: MockConversation[] = [
  {
    id: 1,
    name: 'Kati Kask',
    isGroup: false,
    participants: [currentUser, mockUsers[1]],
    lastMessage: 'Aitäh info eest! Näeme homme.',
    lastMessageTime: new Date(today.setHours(10, 32)),
    unreadCount: 2,
  },
  {
    id: 2,
    name: 'Päevalillede rühm',
    isGroup: true,
    participants: [currentUser, mockUsers[1], mockUsers[2], mockUsers[4]],
    lastMessage: 'Homme on jalutuskäik, palun riietuge soojalt!',
    lastMessageTime: new Date(today.setHours(9, 15)),
    unreadCount: 0,
  },
  {
    id: 3,
    name: 'Jüri Sepp',
    isGroup: false,
    participants: [currentUser, mockUsers[2]],
    lastMessage: 'Kas Markus saab homme tulla?',
    lastMessageTime: new Date(yesterday.setHours(16, 45)),
    unreadCount: 1,
  },
  {
    id: 4,
    name: 'Anna Mets',
    isGroup: false,
    participants: [currentUser, mockUsers[3]],
    lastMessage: 'Koosoleku materjalid on jagatud.',
    lastMessageTime: new Date(yesterday.setHours(14, 20)),
    unreadCount: 0,
  },
  {
    id: 5,
    name: 'Karupoegade rühm',
    isGroup: true,
    participants: [currentUser, mockUsers[3], mockUsers[4], mockUsers[5]],
    lastMessage: 'Lasteaia sünnipäev on 15. mail.',
    lastMessageTime: new Date(twoDaysAgo.setHours(11, 0)),
    unreadCount: 0,
  },
];

export const mockMessages: Record<number, MockMessage[]> = {
  1: [
    { id: 1, conversationId: 1, senderId: 2, text: 'Tere! Kuidas Liisi täna hakkama sai?', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0) },
    { id: 2, conversationId: 1, senderId: 1, text: 'Tere! Liisi oli väga tubli, ta sõi hästi ja magas rahulikult.', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 5) },
    { id: 3, conversationId: 1, senderId: 2, text: 'Tore kuulda! Kas ta sai ka teisega hästi läbi?', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 10) },
    { id: 4, conversationId: 1, senderId: 1, text: 'Jah, ta mängis kogu päev Markusega. Nad ehitasid koos klotside torni!', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15) },
    { id: 5, conversationId: 1, senderId: 2, text: 'Väga hea! Kas homme on midagi erilist plaanis?', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 28) },
    { id: 6, conversationId: 1, senderId: 1, text: 'Homme läheme õue mängima, kui ilm lubab. Palun pange talle soojad riided kaasa. 🧥', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30) },
    { id: 7, conversationId: 1, senderId: 2, text: 'Aitäh info eest! Näeme homme.', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 32) },
  ],
  2: [
    { id: 8, conversationId: 2, senderId: 1, text: 'Head päeva kõigile! 🌻', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0) },
    { id: 9, conversationId: 2, senderId: 2, text: 'Tere hommikust!', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 5) },
    { id: 10, conversationId: 2, senderId: 4, text: 'Tere! Kas keegi teab, kas ehitusplats on juba tehtud?', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30) },
    { id: 11, conversationId: 2, senderId: 1, text: 'Homme on jalutuskäik, palun riietuge soojalt!', timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15) },
  ],
  3: [
    { id: 12, conversationId: 3, senderId: 3, text: 'Tere! Markus ütles, et talle meeldis täna lasteaias.', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 0) },
    { id: 13, conversationId: 3, senderId: 1, text: 'Tore! Ta oli tõesti rõõmsameelne kogu päev.', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 15) },
    { id: 14, conversationId: 3, senderId: 3, text: 'Kas Markus saab homme tulla?', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 45) },
  ],
  4: [
    { id: 15, conversationId: 4, senderId: 4, text: 'Tere Mari! Koosoleku materjalid on nüüd Google Drive-is.', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 0) },
    { id: 16, conversationId: 4, senderId: 1, text: 'Aitäh, Anna! Vaatan üle.', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 10) },
    { id: 17, conversationId: 4, senderId: 4, text: 'Koosoleku materjalid on jagatud.', timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 20) },
  ],
  5: [
    { id: 18, conversationId: 5, senderId: 6, text: 'Tere kõigile! Soovin teatada, et lasteaia sünnipäev on 15. mail.', timestamp: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 10, 30) },
    { id: 19, conversationId: 5, senderId: 4, text: 'Väga hea! Me hakkame ette valmistama.', timestamp: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 10, 45) },
    { id: 20, conversationId: 5, senderId: 6, text: 'Lasteaia sünnipäev on 15. mail.', timestamp: new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 11, 0) },
  ],
};
