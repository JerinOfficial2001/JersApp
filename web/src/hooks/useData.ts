import { useAtom } from 'jotai';
import { chatAtom, contactAtom, groupAtom, storyAtom,  } from '../state/atoms';

export function useChat() {
  return useAtom(chatAtom);
}

export function useContact() {
  return useAtom(contactAtom);
}

export function useGroup() {
  return useAtom(groupAtom);
}
export function useStory() {
  return useAtom(storyAtom);
}
