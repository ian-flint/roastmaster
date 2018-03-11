# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
import datetime

# Create your models here.
class Roast(models.Model):
    timestamp = models.DateTimeField(default=datetime.datetime.now)
    coffee_type = models.CharField(max_length=100)
    weight = models.FloatField()
    roast_type = models.CharField(max_length=100)
    quality = models.CharField(max_length=100, null=True)
    notes = models.CharField(max_length=2000, null=True)

class DataPoint(models.Model):
    roast = models.ForeignKey(Roast, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=datetime.datetime.now)
    element_temp = models.IntegerField(blank=True, null=True)
    bean_temp = models.IntegerField(blank=True, null=True)
    loft_setting = models.FloatField(blank=True, null=True)
    heat_setting = models.FloatField(blank=True, null=True)
    event = models.CharField(max_length=100, blank=True, null=True)
