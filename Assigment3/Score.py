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
sys.stdout = open('FILE_3.csv','w')

with open("data.csv", 'r') as csvfile:
    with open("predict.csv", 'r') as predictfile:
        lines = list(csv.reader(csvfile, delimiter=','))
        linetuples = list(csv.reader(predictfile, delimiter=','))
        l = len(lines)
        for i in range(l):
            line = lines[i]
            linetuple = linetuples[i]
            if linetuple[1] == '1':
                print("{},{},{}"\
                        .format(line[0].strip(),line[7].strip(),float(linetuple[2].strip())))
