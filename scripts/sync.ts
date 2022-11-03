#!/usr/bin/env zx

import { fetch } from 'zx';
import pkg from '../package.json';

const requestUrl = `https://npmmirror.com/sync/${pkg.name}`;

fetch(requestUrl);
