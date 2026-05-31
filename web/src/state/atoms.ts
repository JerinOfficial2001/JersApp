// src/state/atoms.ts

import { Chat, Contact, Group, Story } from '@/types/model';
import { atom } from 'jotai';

type ChatConfig = {
  selected: Chat['_id'] | null;
};

type ContactConfig = {
  selected: Contact['_id'] | null;
};

type GroupConfig = {
  selected: Group['_id'] | null;
};
type StoryConfig = {
  selected: Story['_id'] | null;
};

export const chatAtom = atom<ChatConfig>({
  selected: null,
});

export const contactAtom = atom<ContactConfig>({
  selected: null,
});

export const groupAtom = atom<GroupConfig>({
  selected: null,
});
export const storyAtom = atom<StoryConfig>({
  selected: null,
});
