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
sys.stdout = open('out1.csv','w', encoding='UTF-8')

with open("data.csv", 'r', encoding='UTF-8') as csvfile:
    with open("predict.csv", 'r', encoding='UTF-8') as predictfile:
        lines = list(csv.reader(csvfile, delimiter=','))
        linetuples = list(csv.reader(predictfile, delimiter=','))
        l = len(lines)
        for i in range(l):
            try:
                line = lines[i]
                linetuple = linetuples[i]
                if line[8] == '1':
                    number1 += 1
                    if linetuple[1] != '1':
                        wrongnumber1 += 1
                    print("{},{},{},{},{},{},{},{},{}"\
                         .format(line[0].strip(),line[1].strip(),line[2].strip(),line[3].strip(),line[4].strip(),
                                 line[5].strip(),line[6].strip(),line[7].strip(),linetuple[1].strip()))
                else:
                    if linetuple[1] != '0':
                        wrongnumber2 += 1
                    print("{},{},{},{},{},{},{},{},{}"\
                         .format(line[0].strip(),line[1].strip(),line[2].strip(),line[3].strip(),line[4].strip(),
                                 line[5].strip(),line[6].strip(),line[7].strip(),linetuple[1].strip()))
                    number2 += 1
            except:
                continue
                miss += 0
sys.stdout = temp
print(miss)
print("1-number:{}, 1-wrong:{}\n0-number:{}, 0-wrong:{}\n".format(number1, wrongnumber1, number2, wrongnumber2))
