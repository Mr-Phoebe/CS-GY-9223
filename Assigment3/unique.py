# _*_ coding:utf-8 _*_
from __future__ import print_function
import pandas as pd
import csv
import sys

temp = sys.stdout
sys.stdout = open('out1.csv','w')

have = {}

with open("input.csv", 'r') as csvfile:
    lines = list(csv.reader(csvfile, delimiter=','))
    l = len(lines)
    for i in range(l):
        line = lines[i]

        if line[0] not in have:
            have[line[0]] = 1
        else:
            continue
        print("{},{},{}"\
                .format(line[0].strip(),line[1].strip(),line[2].strip()))