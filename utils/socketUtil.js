import {io} from 'socket.io-client';
import {iprotecsLapIP} from '../src/api';

const socket = io(iprotecsLapIP);

export default socket;
