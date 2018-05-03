# _*_ coding:utf-8 _*_
from __future__ import print_function
import pandas as pd
import csv
import sys

number1 = 0
wrongnumber1 = 0
number2 = 0
wrongnumber2 = 0
miss = 0

temp = sys.stdout
sys.stdout = open('out1.csv','w')

have = {}

with open("FILE_1.csv", 'r') as csvfile:
    lines = list(csv.reader(csvfile, delimiter=','))
    l = len(lines)
    for i in range(l):
        line = lines[i]
        for j in range(len(line)):
            if len(line[j]) == 0:
                line[j] = 'Null'

        if line[0].strip() in have:
            continue
        have[line[0].strip()] = 1  
        print("{},{},{},{},{},{},{},{},{}"\
                .format(line[0].strip(),line[1].strip(),line[2].strip(),line[3].strip(),line[4].strip(),
                        line[5].strip(),line[6].strip(),line[7].strip(),line[8].strip()))